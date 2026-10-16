/** A small handle around one key of the global state. */
import { getState, setState, initState } from "./state.js";

/** A handle on one key of the global state. */
export class Ref {
    /** The state key this handle points to. */
    key;

    /**
     * Creates a handle for a state key.
     * @param {string} key - The state key this handle points to.
     */
    constructor(key) {
        this.key = key;
    }

    /** The current value of the state key. */
    get value() {
        return getState(this.key);
    }

    set value(next) {
        setState(this.key, next);
    }

    /**
     * Sets the value from the previous one.
     * @param {function} fn - Receives the current value, returns the next.
     * @returns {void}
     */
    update(fn) {
        this.value = fn(this.value);
    }

    /**
     * Lets a ref be used in arithmetic (`count + 1`).
     * @returns {*} The current value.
     */
    valueOf() {
        return this.value;
    }

    /**
     * Lets a ref be used as text (`${count}`).
     * @returns {string} The current value as a string.
     */
    toString() {
        return String(this.value);
    }
}

/**
 * Declares a piece of global state and returns a {@link module:state/ref.Ref} to it.
 * @param {string} key - Unique state key, shared by the whole app.
 * @param {*} initial - Value used if the key does not exist yet.
 * @returns {Ref} A handle on the state key.
 */
export function ref(key, initial) {
    initState(key, initial);
    return new Ref(key);
}
