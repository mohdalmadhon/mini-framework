/** the global state: key to value. */
export const componentStates = new Map();

/** the functions to call when the state changes. */
const listeners = new Set();

/**
 * read a value from the state.
 * @param {string} key - the state key.
 * @param {*} [fallback] - what you get if the key is not there.
 * @returns {*} the value, or the fallback.
 */
export function getState(key, fallback) {
    return componentStates.has(key) ? componentStates.get(key) : fallback;
}

/**
 * check if a key is in the state.
 * @param {string} key - the state key.
 * @returns {boolean} true if it is there.
 */
export function hasState(key) {
    return componentStates.has(key);
}

/**
 * set a key only if it is not there yet. it does not render again.
 * @param {string} key - the state key.
 * @param {*} value - the first value.
 * @returns {void}
 */
export function initState(key, value) {
    if (!componentStates.has(key)) componentStates.set(key, value);
}

/**
 * change a value in the state and tell everyone (the app renders again).
 * nothing happens if the value is the same.
 * @param {string} key - the state key.
 * @param {*} value - the new value.
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
 * call a function every time the state changes.
 * @param {function(string, *): void} listener - gets the key and the new value.
 * @returns {function(): void} call it to stop.
 */
export function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
