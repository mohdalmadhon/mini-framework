import { VElement } from "../utils/elemant.js";
import { applyAttrs } from "./attrs.js";

/** the namespace of svg elements. */
export const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * find the namespace the children of this parent need.
 * inside an svg it is the svg one, everywhere else it is normal html.
 * @param {Node|null} parent - the real parent.
 * @returns {string|null} the svg namespace, or null for html.
 */
export function namespaceOf(parent) {
    return parent &&
        parent.namespaceURI === SVG_NS &&
        parent.localName !== "foreignObject"
        ? SVG_NS
        : null;
}

/**
 * turn a virtual element into a real one.
 * it goes down the children one by one (recursive).
 * @param {VElement|string} node - a virtual element, or text.
 * @param {string|null} [parentNs=null] - the namespace from the parent.
 * @returns {Element|Text} the real node (not in the page yet).
 * @throws {TypeError} when node is not a VElement or text.
 */
export function render(node, parentNs = null) {
    if (typeof node === "string") {
        return document.createTextNode(node);
    }

    if (!(node instanceof VElement)) {
        throw new TypeError("render: expected a VElement or a string");
    }

    const ns = node.tagsName === "svg" ? SVG_NS : parentNs;
    const el = ns
        ? document.createElementNS(ns, node.tagsName)
        : document.createElement(node.tagsName);

    applyAttrs(el, {}, node.attrs, false);

    const childNs = node.tagsName === "foreignObject" ? null : ns;
    for (const child of node.children) {
        el.appendChild(render(child, childNs));
    }

    applyAttrs(el, {}, node.attrs, true);

    return el;
}
