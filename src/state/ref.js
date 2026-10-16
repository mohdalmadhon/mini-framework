/**
 * @module state/ref
 */
import { getState, setState, initState } from "./state.js";

/**
 * A handle on one key of the global state. Reading `.value` returns the
 * current value; assigning `.value` updates the state and re-renders.
 *
 * @class
 */
export class Ref {
    /** @type {string} */
    key;

    /**
     * @param {string} key - The state key this handle points to.
     */
    constructor(key) {
        this.key = key;
    }

    /**
     * The current value of the state key. Assigning triggers a re-render.
     *
     * @type {*}
     */
    get value() {
        return getState(this.key);
    }

    set value(next) {
        setState(this.key, next);
    }

    /**
     * Sets the value from the previous one.
     *
     * @param {(current: *) => *} fn - Receives the current value, returns the next.
     * @returns {void}
     *
     * @example
     * count.update((n) => n + 1);
     */
    update(fn) {
        this.value = fn(this.value);
    }

    /**
     * Lets a ref be used in arithmetic (`count + 1`).
     *
     * @returns {*}
     */
    valueOf() {
        return this.value;
    }

    /**
     * Lets a ref be used as text (`${count}`).
     *
     * @returns {string}
     */
    toString() {
        return String(this.value);
    }
}

/**
 * Declares a piece of global state and returns a {@link Ref} to it.
 * The initial value is used only the first time the key is declared, so it is
 * safe to call `ref(...)` inside a component on every render.
 *
 * @param {string} key - Unique state key, shared by the whole app.
 * @param {*} initial - Value used if the key does not exist yet.
 * @returns {Ref}
 *
 * @example
 * const count = ref("counter", 0);
 * count.value++;          // updates the state and re-renders
 */
export function ref(key, initial) {
    initState(key, initial);
    return new Ref(key);
}
