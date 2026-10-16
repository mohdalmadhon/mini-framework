/** Factory used to describe the interface as virtual elements. */
import { VElement } from "../utils/elemant.js";

/**
 * Creates a virtual element.
 * @param {string} tag - HTML (or SVG) tag name.
 * @param {module:utils/elemant~Attrs|module:utils/elemant~VChildInput} [attrs] Attributes (or the children when attributes are skipped).
 * @param {module:utils/elemant~VChildInput} [children] - Child nodes.
 * @returns {VElement} A new virtual element.
 * @throws {TypeError} If an argument is invalid.
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

/** Short alias of {@link module:renderer/create_elemant.createElemant}. */
export const h = createElemant;
