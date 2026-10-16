/**
 * @module renderer/create_elemant
 */
import { VElement } from "../utils/elemant.js";

/**
 * Creates a virtual element.
 *
 * `attrs` may be skipped: `createElemant("p", ["Hello"])` and
 * `createElemant("p", "Hello")` are the same as
 * `createElemant("p", {}, ["Hello"])`.
 *
 * @param {string} tag - HTML tag name.
 * @param {import("../utils/elemant.js").Attrs|import("../utils/elemant.js").VChildInput} [attrs]
 *        Attributes (or the children when attributes are skipped).
 * @param {import("../utils/elemant.js").VChildInput} [children] - Child nodes.
 * @returns {VElement}
 * @throws {TypeError} If an argument is invalid.
 *
 * @example
 * createElemant("div", { class: "box" }, [
 *     createElemant("h1", {}, ["Title"]),
 *     createElemant("button", { onClick: () => alert("hi") }, ["Click"]),
 * ]);
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
 * Short alias of {@link createElemant}.
 *
 * @type {typeof createElemant}
 */
export const h = createElemant;
