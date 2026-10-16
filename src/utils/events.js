/**
 * @module utils/events
 *
 * The framework's own event system.
 *
 * Instead of calling `addEventListener` for every element, handlers live in a
 * private registry owned by the framework. For each (target, event type) pair
 * the framework installs ONE small dispatcher through the DOM `on<type>`
 * property (e.g. `el.onclick`). The dispatcher looks the handlers up in the
 * registry and calls them. Because handlers are looked up at event time,
 * re-rendering never has to unbind/rebind anything: it only swaps an entry in
 * the registry.
 *
 * Two ways to use it:
 *  1. Declaratively on elements: `createElemant("button", { onClick: fn })`
 *  2. Globally (keybindings, scroll, resize...): `on("keydown", fn)`
 */

/**
 * @callback EventHandler
 * @param {Event} event - The native DOM event.
 * @returns {void}
 */

/**
 * @typedef {Object} HandlerSlot
 * @property {EventHandler|null} own - The single handler declared on a virtual element.
 * @property {Set<EventHandler>} extra - Handlers added with {@link on}.
 */

/** @type {WeakMap<object, Map<string, HandlerSlot>>} */
const registry = new WeakMap();

/**
 * Tells whether an attribute name looks like an event attribute
 * (`onClick`, `onKeyDown`, `onInput`...).
 *
 * @param {string} name - Attribute name.
 * @returns {boolean}
 */
export function isEventAttr(name) {
    return typeof name === "string" && /^on[A-Za-z]/.test(name);
}

/**
 * Converts an event attribute name to a DOM event type.
 *
 * @param {string} name - e.g. `"onKeyDown"`.
 * @returns {string} e.g. `"keydown"`.
 */
export function toEventName(name) {
    return name.slice(2).toLowerCase();
}

/**
 * Returns (and optionally creates) the handler slot of a target/type pair.
 * Creating a slot installs the dispatcher on the target.
 *
 * @param {object} target - `window`, `document` or an element.
 * @param {string} type - Event type, lowercase.
 * @param {boolean} [create=false] - Create the slot if missing.
 * @returns {HandlerSlot|undefined}
 */
function getSlot(target, type, create = false) {
    let byType = registry.get(target);
    if (!byType) {
        if (!create) return undefined;
        byType = new Map();
        registry.set(target, byType);
    }

    let slot = byType.get(type);
    if (!slot) {
        if (!create) return undefined;
        slot = { own: null, extra: new Set() };
        byType.set(type, slot);
        install(target, type);
    }

    return slot;
}

/**
 * Installs the dispatcher through the `on<type>` property of the target.
 *
 * @param {object} target
 * @param {string} type
 * @returns {void}
 */
function install(target, type) {
    target[`on${type}`] = function dispatch(event) {
        const slot = registry.get(target)?.get(type);
        if (!slot) return;
        if (slot.own) slot.own.call(target, event);
        for (const fn of [...slot.extra]) fn.call(target, event);
    };
}

/**
 * Removes the dispatcher when a slot no longer has any handler.
 *
 * @param {object} target
 * @param {string} type
 * @returns {void}
 */
function cleanup(target, type) {
    const byType = registry.get(target);
    const slot = byType?.get(type);
    if (slot && !slot.own && slot.extra.size === 0) {
        byType.delete(type);
        target[`on${type}`] = null;
    }
}

/**
 * Sets (or clears) the handler declared on a virtual element.
 * Used internally by the renderer; there is exactly one such handler per
 * element and event type.
 *
 * @param {object} target - The DOM element.
 * @param {string} type - Event type, lowercase (`"click"`).
 * @param {EventHandler|null} fn - Handler, or `null` to remove it.
 * @returns {void}
 */
export function setHandler(target, type, fn) {
    if (typeof fn === "function") {
        getSlot(target, type, true).own = fn;
        return;
    }

    const slot = getSlot(target, type);
    if (slot) {
        slot.own = null;
        cleanup(target, type);
    }
}

/**
 * Registers a handler for any event type on any target, e.g. keybindings,
 * scrolling or resizing.
 *
 * Only events that have an `on<type>` property on the target are supported
 * (click, keydown, scroll, resize, hashchange, input, ...).
 *
 * @param {string} type - Event type (`"keydown"`, `"scroll"`...).
 * @param {EventHandler} handler - Function called with the native event.
 * @param {object} [target=window] - `window`, `document` or an element.
 * @returns {() => void} A function that removes this handler.
 *
 * @example
 * const stop = on("keydown", (e) => {
 *     if (e.key === "Escape") closeDialog();
 * });
 * // later: stop();
 */
export function on(type, handler, target = window) {
    getSlot(target, type.toLowerCase(), true).extra.add(handler);
    return () => off(type, handler, target);
}

/**
 * Removes a handler added with {@link on}.
 *
 * @param {string} type - Event type.
 * @param {EventHandler} handler - The same function passed to `on`.
 * @param {object} [target=window] - The same target passed to `on`.
 * @returns {void}
 */
export function off(type, handler, target = window) {
    const lower = type.toLowerCase();
    const slot = getSlot(target, lower);
    if (!slot) return;
    slot.extra.delete(handler);
    cleanup(target, lower);
}
