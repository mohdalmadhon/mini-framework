/**
 * @module renderer/diffing
 *
 * Virtual DOM diffing. Instead of rebuilding the page, the new virtual tree
 * is compared with the previous one and only the differences are applied to
 * the real DOM. Elements that did not change keep their focus, caret and
 * scroll position.
 */
import { VElement } from "../utils/elemant.js";
import { render, namespaceOf } from "./render.js";
import { applyAttrs } from "./attrs.js";

/**
 * Updates one real DOM node so it matches `newV`.
 *
 * @param {VElement|string} oldV - Virtual node that produced `node`.
 * @param {VElement|string} newV - Wanted virtual node.
 * @param {Node} node - The real DOM node for `oldV`.
 * @returns {Node} The node now in the DOM (a new one if it had to be replaced).
 */
export function patchNode(oldV, newV, node) {
    if (typeof oldV === "string" && typeof newV === "string") {
        if (oldV !== newV) node.nodeValue = newV;
        return node;
    }

    if (
        typeof oldV === "string" ||
        typeof newV === "string" ||
        oldV.tagsName !== newV.tagsName
    ) {
        const fresh = render(newV, namespaceOf(node.parentNode));
        node.replaceWith(fresh);
        return fresh;
    }

    applyAttrs(node, oldV.attrs, newV.attrs, false);
    patchChildren(node, oldV.children, newV.children);
    applyAttrs(node, oldV.attrs, newV.attrs, true);

    return node;
}

/**
 * Updates the children of a real DOM parent so they match `newChildren`.
 *
 * Children with a `key` attribute are matched by key (so reordering or
 * deleting list items reuses the right DOM nodes); children without a key
 * are matched by position.
 *
 * @param {Node} parent - Real DOM parent.
 * @param {Array<VElement|string>} oldChildren - Children that produced `parent.childNodes`.
 * @param {Array<VElement|string>} newChildren - Wanted children.
 * @returns {void}
 */
export function patchChildren(parent, oldChildren, newChildren) {
    const oldNodes = Array.from(parent.childNodes);

    /** @type {Map<string|number, number>} */
    const keyed = new Map();
    /** @type {number[]} */
    const unkeyed = [];

    oldChildren.forEach((child, i) => {
        const key = keyOf(child);
        if (key != null && !keyed.has(key)) keyed.set(key, i);
        else if (key == null) unkeyed.push(i);
    });

    const used = new Set();
    let nextUnkeyed = 0;

    const result = newChildren.map((child) => {
        const key = keyOf(child);
        let oldIndex;

        if (key != null) {
            const candidate = keyed.get(key);
            if (candidate !== undefined && !used.has(candidate)) oldIndex = candidate;
        } else {
            oldIndex = unkeyed[nextUnkeyed++];
        }

        if (oldIndex === undefined || !oldNodes[oldIndex]) return render(child, namespaceOf(parent));

        used.add(oldIndex);
        return patchNode(oldChildren[oldIndex], child, oldNodes[oldIndex]);
    });

    oldNodes.forEach((node, i) => {
        if (!used.has(i)) node.remove();
    });

    result.forEach((node, i) => {
        if (parent.childNodes[i] !== node) {
            parent.insertBefore(node, parent.childNodes[i] || null);
        }
    });
}

/**
 * @param {VElement|string} child
 * @returns {string|number|undefined}
 */
function keyOf(child) {
    return typeof child === "string" ? undefined : child.attrs.key ?? undefined;
}
