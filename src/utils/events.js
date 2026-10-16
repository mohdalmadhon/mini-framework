/** The framework's own event system. */

/**
 * A function called when an event happens.
 * @param {Event} event - The native DOM event.
 * @returns {void}
 */

/** The handlers of one (target, event type) pair. */

/** The private handler registry: target, then event type, then its slot. */
const registry = new WeakMap();

/**
 * Tells whether an attribute name looks like an event attribute (`onClick`, `onKeyDown`, `onInput`...).
 * @param {string} name - Attribute name.
 * @returns {boolean} `true` if it starts with `on` followed by a letter.
 */
export function isEventAttr(name) {
    return typeof name === "string" && /^on[A-Za-z]/.test(name);
}

/**
 * Converts an event attribute name to a DOM event type.
 * @param {string} name - e.g. `"onKeyDown"`.
 * @returns {string} e.g. `"keydown"`.
 */
export function toEventName(name) {
    return name.slice(2).toLowerCase();
}

/**
 * Returns (and optionally creates) the handler slot of a target/type pair.
 * @param {object} target - `window`, `document` or an element.
 * @param {string} type - Event type, lowercase.
 * @param {boolean} [create=false] - Create the slot if missing.
 * @returns {HandlerSlot|undefined} The slot, or `undefined` if missing and not created.
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
 * @param {object} target - `window`, `document` or an element.
 * @param {string} type - Event type, lowercase.
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
 * @param {object} target - `window`, `document` or an element.
 * @param {string} type - Event type, lowercase.
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
 * Registers a handler for any event type on any target, e.g. keybindings, scrolling or resizing.
 * @param {string} type - Event type (`"keydown"`, `"scroll"`...).
 * @param {EventHandler} handler - Function called with the native event.
 * @param {object} [target=window] - `window`, `document` or an element.
 * @returns {function} A function that removes this handler.
 */
export function on(type, handler, target = window) {
    getSlot(target, type.toLowerCase(), true).extra.add(handler);
    return () => off(type, handler, target);
}

/**
 * Removes a handler added with {@link module:utils/events.on}.
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
