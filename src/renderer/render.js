import { VElement } from "../utils/elemant.js";

/**
 * 
 * @param {VElement} node 
 * 
 * @returns {HTMLElement}
 */
export function render(node) {

    if (typeof node === "string") {
        return document.createTextNode(node);
    }
    
    const elem = document.createElement(node.tagsName);
    
    if(node.attrs) {
        for (const [k,v] of Object.entries(node.attrs)) {
            if (typeof v === "function") {
                elem[`on${k}`] = v
            } else if (v === true) {
                elem.setAttribute(k, '');
            } else if (v === false || v === null) {
                continue;
            } else {
                elem.setAttribute(k,String(v));
            }
        }
    }

    if (node.children) {
        node.children.forEach(child => {
            elem.appendChild(render(child));
        })
    }

    return elem;
}

/**
 * 
 * @param {HTMLElement} elem 
 * @param {string} k 
 * @param {Function} v 
 */

