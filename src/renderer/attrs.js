/** Applies virtual attributes to real DOM elements. */
import { isEventAttr, toEventName, setHandler } from "../utils/events.js";

/** Properties that describe LIVE state of a form control. */
const LIVE_PROPS = new Set(["value", "checked", "selected"]);

/** Queue of `ref` callbacks waiting for the DOM to be attached and patched. */
const refQueue = [];

/**
 * Calls every pending `ref` callback, in the order they were queued.
 * @returns {void}
 */
export function flushRefs() {
    while (refQueue.length > 0) {
        const [fn, el] = refQueue.shift();
        fn(el);
    }
}

/**
 * Applies or updates the attributes of an element.
 * @param {Element} el - The real DOM element.
 * @param {module:utils/elemant~Attrs} oldAttrs - Previous attributes (`{}` on first render).
 * @param {module:utils/elemant~Attrs} newAttrs - Wanted attributes.
 * @param {boolean} [live=false] - `true` handles only `value`/`checked`/`selected`.
 * @returns {void}
 */
export function applyAttrs(el, oldAttrs, newAttrs, live = false) {
    const names = new Set([...Object.keys(oldAttrs), ...Object.keys(newAttrs)]);

    for (const name of names) {
        if (LIVE_PROPS.has(name) !== live) continue;
        if (name === "key") continue;

        const oldV = oldAttrs[name];
        const newV = newAttrs[name];

        if (name === "ref") {
            if (typeof newV === "function") refQueue.push([newV, el]);
            continue;
        }

        if (live) {
            applyLive(el, name, newV);
            continue;
        }

        if (isEventAttr(name)) {
            setHandler(el, toEventName(name), typeof newV === "function" ? newV : null);
            continue;
        }

        if (name === "style") {
            applyStyle(el, oldV, newV);
            continue;
        }

        if (oldV === newV) continue;

        if (newV == null || newV === false) {
            el.removeAttribute(name);
        } else {
            el.setAttribute(name, newV === true ? "" : String(newV));
        }
    }
}

/**
 * Writes one live property (`value`, `checked` or `selected`) to the DOM property of the element, but only when it really differs, so the caret and the selection of an input are not disturbed.
 * @param {Element} el - The real DOM element.
 * @param {string} name - `value`, `checked` or `selected`.
 * @param {*} value - Wanted value.
 * @returns {void}
 */
function applyLive(el, name, value) {
    if (!(name in el)) {
        if (value == null || value === false) el.removeAttribute(name);
        else el.setAttribute(name, value === true ? "" : String(value));
        return;
    }

    if (name === "value") {
        const text = value == null ? "" : String(value);
        if (el.value !== text) el.value = text;
        return;
    }

    const flag = Boolean(value);
    if (el[name] !== flag) el[name] = flag;
}

/**
 * Applies the `style` attribute.
 * @param {HTMLElement} el - The real DOM element.
 * @param {string|Object|null|undefined} oldV - Previous style.
 * @param {string|Object|null|undefined} newV - Wanted style.
 * @returns {void}
 */
function applyStyle(el, oldV, newV) {
    if (newV == null || newV === false) {
        el.removeAttribute("style");
        return;
    }

    if (typeof newV === "string") {
        if (oldV !== newV) el.setAttribute("style", newV);
        return;
    }

    if (typeof oldV === "string") el.removeAttribute("style");

    const previous = oldV && typeof oldV === "object" ? oldV : {};

    for (const prop of Object.keys(previous)) {
        if (!(prop in newV)) setStyleProp(el, prop, "");
    }

    for (const [prop, value] of Object.entries(newV)) {
        setStyleProp(el, prop, value ?? "");
    }
}

/**
 * Sets one inline style property.
 * @param {HTMLElement} el - The real DOM element.
 * @param {string} prop - camelCase (`backgroundColor`) or dashed (`--gap`).
 * @param {string|number} value - CSS value (`""` clears the property).
 * @returns {void}
 */
function setStyleProp(el, prop, value) {
    if (prop.includes("-")) el.style.setProperty(prop, String(value));
    else el.style[prop] = String(value);
}
