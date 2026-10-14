import { VElement } from "../utils/elemant.js";
import {renderElemant} from './render.js'

/**
 * 
 * @param {VElement} oldVTree -- old version of the virtaul tree
 * @param {VElement|null} newVTree -- the changed version of the virtual tree
 * 
 * @returns {VElement} - updated tree
 */
export function diff(oldVTree, newVTree) {
    if (newVTree == null) {
        return (node) => {
            node.remove();
            return undefined;
        };
    }

    if (typeof oldVTree === "string" || typeof newVTree === "string") {
        if (oldVTree !== newVTree) {
            return (node) => {
                const newNode = renderElemant(newVTree);
                node.replaceWith(newNode);
                return newNode;
            }
        }
        return (node) => node;
    }

    if (oldVTree.tagsName !== newVTree.tagsName) {
        return (node) => {
            const newNode = renderElemant(newVTree);
            node.replaceWith(newNode);
            return newNode;
        }
    }

    const patchAttrs = diffAtters((oldVTree.attrs || {}), (newVTree.attrs || {}));
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
 * 
 * @param {Object} newVAttrs 
 * @param {Object} oldVAttrs 
 */
export function diffAtters(newVAttrs, oldVAttrs) {
    return (node) => {
        Object.entries(newVAttrs).forEach(([newK, newV]) => {
            if (oldVAttrs[newK] !== newV) {
                if (/^on[A-Z]/.test(newK)) {
                    const eventName = newK.slice(2).toLowerCase();
                    node[`on${eventName}`] = typeof newV === "function" ? newV : null;
                } else if (newV == null || newV === false) {
                    node.removeAttribute(newK);
                } else if (newV === true) {
                    node.setAttribute(newK, "");
                } else {
                    node.setAttribute(newK, newV);
                }
            }
        });

        Object.keys(oldVAttrs).forEach((oldK) => {
            if (!(oldK in newVAttrs)) {
                if (/^on[A-Z]/.test(oldK)) {
                    const eventName = oldK.slice(2).toLowerCase();
                    node[`on${eventName}`] = null;
                } else {
                    node.removeAttribute(oldK);
                }
            }
        });

        return node;
    };
}

export function diffChildren(newVChildren, oldVChildren) {
    const patches = [];
    const maxLength = Math.max(newVChildren.length, oldVChildren.length);

    for (let i = 0; i < maxLength; i++) {
        patches.push(
            diff(oldVChildren[i], newVChildren[i])
        );
    }

    return (node) => {
        const childNodes = Array.from(node.childNodes);

        for (let i = 0; i < patches.length; i++) {
            const childNode = childNodes[i];

            if (childNode) {
                patches[i](childNode);
            } else if (i < newVChildren.length) {
                const newNode = renderElemant(newVChildren[i]);
                node.appendChild(newNode);
            }
        }

        return node;
    };
}