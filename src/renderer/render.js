import { VElement } from "../utils/elemant.js";
import { attachListener, isTypeEventListener, isValidEvent, toEventName } from "../utils/events.js";

export function renderElemant(node) {
    if (typeof node === "string") {
        return document.createTextNode(node);
    }

    if (!(node instanceof VElement)) {
        throw new TypeError("Invalid virtual DOM node");
    }

    const elem = document.createElement(node.tagsName);

    if (node.attrs) {
        for (const [k, v] of Object.entries(node.attrs)) {
            if (typeof v === "function" && isValidEvent(k)) {
                const eventName = k.slice(2).toLowerCase();
                elem[`on${eventName}`] = v;
            } else if (v === true) {
                elem.setAttribute(k, "");
            } else if (v === false || v == null) {
                continue;
            } else {
                elem.setAttribute(k, String(v));
            }
        }
    }

    for (const child of node.children) {
        elem.appendChild(renderElemant(child));
    }

    return elem;
}
