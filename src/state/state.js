/** The global state store. */

/**
 * Called every time a state value changes.
 * @param {string} key - The key that changed.
 * @param {*} value - Its new value.
 * @returns {void}
 */

/** The store itself: state key to value. */
export const componentStates = new Map();

/** Functions to call when the state changes. */
const listeners = new Set();

/**
 * Reads a value from the global state.
 * @param {string} key - State key.
 * @param {*} [fallback] - Returned when the key does not exist.
 * @returns {*} The stored value, or `fallback`.
 */
export function getState(key, fallback) {
    return componentStates.has(key) ? componentStates.get(key) : fallback;
}

/**
 * Tells whether a key exists in the state.
 * @param {string} key - State key.
 * @returns {boolean} `true` if the key exists.
 */
export function hasState(key) {
    return componentStates.has(key);
}

/**
 * Sets a key only if it does not exist yet, WITHOUT notifying subscribers.
 * @param {string} key - State key.
 * @param {*} value - Initial value.
 * @returns {void}
 */
export function initState(key, value) {
    if (!componentStates.has(key)) componentStates.set(key, value);
}

/**
 * Writes a value to the global state and notifies subscribers (which schedules a re-render).
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
 * @param {StateListener} listener - Function called with the key and the new value.
 * @returns {function} A function that stops the subscription.
 */
export function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
