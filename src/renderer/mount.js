import { VElement } from "../utils/elemant.js";
import { render } from "./render.js";

/**
 * 
 * @param {HTMLElement} node 
 * @param {HTMLElement} target
 * 
 * @returns {HTMLElement} 
 */
export function mount(node, target) {
    target.replaceWith(node);
    return node;
}

/**
 * 
 * @param {VElement} entry 
 */
export function build(entry) {
    const app = render(entry());
    const div = document.getElementById("app");
    if (!div) throw new Error("Error mounting app");
    mount(app, div); 
}