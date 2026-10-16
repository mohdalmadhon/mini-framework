import { VElement } from "../utils/elemant.js";

/**
 * make a virtual element.
 * you can skip the attrs and pass the children right away.
 * @param {string} tag - the tag name like "div" or "svg".
 * @param {object|Array|string} [attrs] - the attributes, or the children if you skip them.
 * @param {Array|string|VElement} [children] - what goes inside.
 * @returns {VElement} the new element.
 * @throws {TypeError} when something is not valid.
 * @example
 * createElemant("p", { class: "big" }, ["hello"]);
 * createElemant("p", "hello");
 */
export function createElemant(tag, attrs, children) {
    if (
        children === undefined &&
        (Array.isArray(attrs) ||
            typeof attrs === "string" ||
            typeof attrs === "number" ||
            attrs instanceof VElement)
    ) {
        children = attrs;
        attrs = {};
    }

    return new VElement(tag, attrs ?? {}, children ?? []);
}

/**
 * short name for createElemant.
 * @type {typeof createElemant}
 */
export const h = createElemant;
