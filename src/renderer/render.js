/** Turns virtual nodes into real DOM nodes. */
import { VElement } from "../utils/elemant.js";
import { applyAttrs } from "./attrs.js";

/** XML namespace of SVG elements. */
export const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Namespace that children of `parent` must be created in: SVG inside an `<svg>` (except inside `<foreignObject>`), plain HTML otherwise.
 * @param {Node|null} parent - Real DOM parent.
 * @returns {string|null} The SVG namespace, or `null` for HTML.
 */
export function namespaceOf(parent) {
    return parent &&
        parent.namespaceURI === SVG_NS &&
        parent.localName !== "foreignObject"
        ? SVG_NS
        : null;
}

/**
 * Turns a virtual node into a real (detached) DOM node.
 * @param {VElement|string} node - Virtual element, or a string for a text node.
 * @param {string|null} [parentNs=null] - Namespace inherited from the parent.
 * @returns {Element|Text} The real DOM node.
 * @throws {TypeError} If `node` is not a `VElement` or a string.
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
