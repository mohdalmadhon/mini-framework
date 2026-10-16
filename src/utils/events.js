/**
 * the framework events.
 * no addEventListener: the handlers are kept in a list here, and each element
 * gets one small function on its on<type> property that calls them.
 */

/** the handlers: target, then event type, then { own, extra }. */
const registry = new WeakMap();

/**
 * check if an attribute is an event (onClick, onKeyDown...).
 * @param {string} name - the attribute name.
 * @returns {boolean} true if it starts with "on" and a letter.
 */
export function isEventAttr(name) {
    return typeof name === "string" && /^on[A-Za-z]/.test(name);
}

/**
 * turn an event attribute into the event type.
 * @param {string} name - like "onKeyDown".
 * @returns {string} like "keydown".
 */
export function toEventName(name) {
    return name.slice(2).toLowerCase();
}

/**
 * get the handlers of a target and type, and make them if needed.
 * @param {object} target - window, document or an element.
 * @param {string} type - the event type in small letters.
 * @param {boolean} [create=false] - true to make it if it is not there.
 * @returns {{own: function|null, extra: Set<function>}|undefined} the handlers, or undefined.
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
 * put the one function on the on<type> property of the target.
 * @param {object} target - window, document or an element.
 * @param {string} type - the event type in small letters.
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
 * remove the function when there is no handler left.
 * @param {object} target - window, document or an element.
 * @param {string} type - the event type in small letters.
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
 * set or remove the handler that comes from an element attribute (onClick...).
 * @param {object} target - the element.
 * @param {string} type - the event type like "click".
 * @param {function|null} fn - the handler, or null to remove it.
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
 * listen to any event on any target, like keys, scroll or resize.
 * @param {string} type - the event type like "keydown".
 * @param {function(Event): void} handler - gets the event.
 * @param {object} [target=window] - window, document or an element.
 * @returns {function(): void} call it to stop listening.
 * @example
 * const stop = on("keydown", (e) => console.log(e.key));
 * stop();
 */
export function on(type, handler, target = window) {
    getSlot(target, type.toLowerCase(), true).extra.add(handler);
    return () => off(type, handler, target);
}

/**
 * stop listening to an event added with on.
 * @param {string} type - the same type.
 * @param {function(Event): void} handler - the same function.
 * @param {object} [target=window] - the same target.
 * @returns {void}
 */
export function off(type, handler, target = window) {
    const lower = type.toLowerCase();
    const slot = getSlot(target, lower);
    if (!slot) return;
    slot.extra.delete(handler);
    cleanup(target, lower);
}
