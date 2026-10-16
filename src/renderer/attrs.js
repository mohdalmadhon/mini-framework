/**
 * @module renderer/attrs
 *
 * Applies virtual attributes to real DOM elements. Both the first render and
 * later patches use this file, so an attribute always behaves the same way.
 */
import { isEventAttr, toEventName, setHandler } from "../utils/events.js";

/**
 * Properties that describe LIVE state of a form control. They are written to
 * the DOM property (not the HTML attribute) and re-checked against the real
 * DOM on every patch, so a controlled input always shows what the state says.
 */
const LIVE_PROPS = new Set(["value", "checked", "selected"]);

/** @type {Array<[Function, Element]>} */
const refQueue = [];

/**
 * Calls every pending `ref` callback. Called once the DOM is attached and
 * patched, so `el.focus()` and friends work.
 *
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
 *
 * It runs twice per element: once for normal attributes (before the children
 * exist) and once for live properties (after the children exist, which
 * `<select value>` needs).
 *
 * @param {Element} el - The real DOM element.
 * @param {import("../utils/elemant.js").Attrs} oldAttrs - Previous attributes (`{}` on first render).
 * @param {import("../utils/elemant.js").Attrs} newAttrs - Wanted attributes.
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
 * @param {Element} el
 * @param {string} name - `value`, `checked` or `selected`.
 * @param {*} value
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
 * @param {HTMLElement} el
 * @param {string|Object|null|undefined} oldV
 * @param {string|Object|null|undefined} newV
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
 * @param {HTMLElement} el
 * @param {string} prop - camelCase (`backgroundColor`) or dashed (`--gap`).
 * @param {string|number} value
 * @returns {void}
 */
function setStyleProp(el, prop, value) {
    if (prop.includes("-")) el.style.setProperty(prop, String(value));
    else el.style[prop] = String(value);
}
