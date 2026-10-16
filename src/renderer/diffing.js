import { render, namespaceOf } from "./render.js";
import { applyAttrs } from "./attrs.js";

/**
 * update one real node so it looks like the new virtual one.
 * if the tag is different it makes a new node, if not it only changes what is different.
 * @param {VElement|string} oldV - the old virtual node.
 * @param {VElement|string} newV - the new virtual node.
 * @param {Node} node - the real node of the old one.
 * @returns {Node} the node that is in the page now.
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
 * update the children of a real parent.
 * children with a key are matched by key, the others by order.
 * old ones that are not used are removed, and the rest are put in the right order.
 * @param {Node} parent - the real parent.
 * @param {Array<VElement|string>} oldChildren - the old virtual children.
 * @param {Array<VElement|string>} newChildren - the new virtual children.
 * @returns {void}
 */
export function patchChildren(parent, oldChildren, newChildren) {
    const oldNodes = Array.from(parent.childNodes);
    const keyed = new Map();
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
 * get the key of a virtual child.
 * @param {VElement|string} child - the child (text has no key).
 * @returns {string|number|undefined} the key, or undefined.
 */
function keyOf(child) {
    return typeof child === "string" ? undefined : child.attrs.key ?? undefined;
}
