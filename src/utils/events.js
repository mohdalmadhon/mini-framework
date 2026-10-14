/**
 * function to check if the passed function is type of event listener 
 * 
 * @param {Function} f function to check if it's type listener
 * @returns {boolean} validated or not
 */
export function isTypeEventListener(f) {
    return typeof f === "function";
}

export function attachListener(el, attrKey, fn) {
    
}

const VALID_EVENTS = [
    "click",
    "dblclick",
    "input",
    "change",
    "submit",
    "keydown",
    "keyup",
    "keypress",
    "pointerdown",
    "pointerup",
    "pointermove",
    "mousedown",
    "mouseup",
    "mouseover",
    "mouseout",
    "mouseenter",
    "mouseleave",
    "focus",
    "blur",
    "drag",
    "dragstart",
    "dragend",
    "dragover",
    "drop"
];

export function isValidEvent(key, value) {
    if (typeof key !== "string" || typeof value !== "function") {
        return false;
    }

    if (!/^on[A-Z]/.test(key)) {
        return false;
    }

    const eventName = key.slice(2).toLowerCase();

    return VALID_EVENTS.includes(eventName);
}

export function toEventName(key) {
    return key.slice(2).toLowerCase();
}