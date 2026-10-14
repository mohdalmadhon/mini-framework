import { Ref } from "./ref.js";

export const componentStates = new Map();

/**
 * @param {String} key
 * @param {any} value
 */
export function ref(key, value) {
    if (!componentStates.has(key)) {
        componentStates.set(key, value);
    }

    return new Ref(key);
}