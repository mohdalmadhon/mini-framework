/**
 * @module state/state
 *
 * The global state store. It is one shared `Map`, so every page and every
 * component can reach the same state at any time. Changing a value notifies
 * the subscribers; the renderer is one of them and re-renders the app.
 */

/**
 * @callback StateListener
 * @param {string} key - The key that changed.
 * @param {*} value - Its new value.
 * @returns {void}
 */

/** @type {Map<string, *>} */
export const componentStates = new Map();

/** @type {Set<StateListener>} */
const listeners = new Set();

/**
 * Reads a value from the global state.
 *
 * @param {string} key - State key.
 * @param {*} [fallback] - Returned when the key does not exist.
 * @returns {*}
 */
export function getState(key, fallback) {
    return componentStates.has(key) ? componentStates.get(key) : fallback;
}

/**
 * Tells whether a key exists in the state.
 *
 * @param {string} key
 * @returns {boolean}
 */
export function hasState(key) {
    return componentStates.has(key);
}

/**
 * Sets a key only if it does not exist yet, WITHOUT notifying subscribers.
 * Used to give a state its first value while rendering.
 *
 * @param {string} key
 * @param {*} value - Initial value.
 * @returns {void}
 */
export function initState(key, value) {
    if (!componentStates.has(key)) componentStates.set(key, value);
}

/**
 * Writes a value to the global state and notifies subscribers (which
 * schedules a re-render). Nothing happens if the value is identical
 * (`Object.is`). For arrays and objects, store a NEW array/object instead of
 * mutating the old one.
 *
 * @param {string} key - State key.
 * @param {*} value - New value.
 * @returns {void}
 */
export function setState(key, value) {
    if (componentStates.has(key) && Object.is(componentStates.get(key), value)) {
        return;
    }

    componentStates.set(key, value);
    for (const listener of [...listeners]) listener(key, value);
}

/**
 * Calls `listener` every time any state value changes.
 *
 * @param {StateListener} listener
 * @returns {() => void} A function that stops the subscription.
 */
export function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
