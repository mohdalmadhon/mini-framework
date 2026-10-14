import { VElement } from "../utils/elemant.js";

/**
 * 
 * @param {VElement} oldVTree 
 * @param {VElement|null} newVTree 
 * 
 * @returns {Function}
 */
export function diff(oldVTree, newVTree) {
    if (newVTree == null) {
        return (node) => {
            node.remove();
            return undefined;
        };
    }

    if (
        typeof oldVTree === "string" ||
        typeof newVTree === "string"
    ) {
        if (oldVTree !== newVTree) {
            return (node) => {
                const newNode = render(newVTree);
                node.replaceWith(newNode);
                return newNode;
            };
        }

        return (node) => node;
    }

    if (oldVTree.tagsName !== newVTree.tagsName) {
        return (node) => {
            const newNode = render(newVTree);
            node.replaceWith(newNode);
            return newNode;
        };
    }

    const patchAttrs = diffAttrs(
        oldVTree.attrs,
        newVTree.attrs
    );

    const patchChildren = diffChildren(
        oldVTree.children || [],
        newVTree.children || []
    );

    return (node) => {
        if (node instanceof HTMLElement) {
            patchAttrs(node);
            patchChildren(node);
        }

        return node;
    };
}

/**
 * @param {Object} oldAttrs
 * @param {Object} newAttrs
 *
 * @returns {Function}
 */
export function diffAttrs(oldAttrs = {}, newAttrs = {}) {
    return (node) => {
        const attrs = new Set([
            ...Object.keys(oldAttrs || {}),
            ...Object.keys(newAttrs || {}),
        ]);

        for (const attr of attrs) {
            const oldValue = oldAttrs?.[attr];
            const newValue = newAttrs?.[attr];

            if (oldValue === newValue) {
                continue;
            }

            if (attr.startsWith("on")) {
                const eventName = attr.toLowerCase();

                node[eventName] =
                    typeof newValue === "function" ? newValue : null;

                continue;
            }

            if (newValue == null || newValue === false) {
                node.removeAttribute(attr);

                if (attr in node) {
                    node[attr] = "";
                }

                continue;
            }

            if (attr === "style" && typeof newValue === "object") {
                Object.assign(node.style, newValue);
            } else if (
                attr in node &&
                !attr.startsWith("data-") &&
                !attr.startsWith("aria-")
            ) {
                node[attr] = newValue;
            } else {
                node.setAttribute(
                    attr,
                    newValue === true ? "" : newValue
                );
            }
        }

        return node;
    };
}

/**
 * @param {Array<VElement|string>} oldChildren
 * @param {Array<VElement|string>} newChildren
 *
 * @returns {Function}
 */
export function diffChildren(oldChildren = [], newChildren = []) {
    const childDiffs = [];
    const maxLength = Math.max(oldChildren.length, newChildren.length);

    for (let i = 0; i < maxLength; i++) {
        childDiffs.push(
            diff(oldChildren[i] ?? null, newChildren[i] ?? null)
        );
    }

    return (node) => {
        const domChildren = Array.from(node.childNodes);

        for (let i = 0; i < childDiffs.length; i++) {
            const oldNode = domChildren[i];
            const newChild = newChildren[i];

            if (oldNode) {
                const updatedNode = childDiffs[i](oldNode);

                if (updatedNode && newChild != null) {
                    continue;
                }
            } else if (newChild != null) {
                node.appendChild(render(newChild));
            }
        }

        return node;
    };
}