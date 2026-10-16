import { getState, setState, initState } from "./state.js";

/**
 * a handle on one key of the global state.
 * read it with .value, and set .value to change it (the app renders again).
 */
export class Ref {
    /** the state key. */
    key;

    /**
     * make a handle for a key.
     * @param {string} key - the state key.
     */
    constructor(key) {
        this.key = key;
    }

    /**
     * the value now.
     * @returns {*}
     */
    get value() {
        return getState(this.key);
    }

    /**
     * change the value.
     * @param {*} next - the new value.
     */
    set value(next) {
        setState(this.key, next);
    }

    /**
     * change the value using the old one.
     * @param {function(*): *} fn - gets the old value and gives back the new one.
     * @returns {void}
     * @example
     * count.update((n) => n + 1);
     */
    update(fn) {
        this.value = fn(this.value);
    }

    /**
     * so you can do math with it (count + 1).
     * @returns {*} the value.
     */
    valueOf() {
        return this.value;
    }

    /**
     * so you can put it in text (`${count}`).
     * @returns {string} the value as text.
     */
    toString() {
        return String(this.value);
    }
}

/**
 * make a piece of global state and get a handle on it.
 * the first value is used only the first time, so you can call it in every render.
 * @param {string} key - a key that is the same for the whole app.
 * @param {*} initial - the first value.
 * @returns {Ref} the handle.
 * @example
 * const count = ref("count", 0);
 * count.value++;
 */
export function ref(key, initial) {
    initState(key, initial);
    return new Ref(key);
}
