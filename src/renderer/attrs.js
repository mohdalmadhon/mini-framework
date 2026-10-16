import { isEventAttr, toEventName, setHandler } from "../utils/events.js";

/** these are set on the element itself so inputs always show the state. */
const LIVE_PROPS = new Set(["value", "checked", "selected"]);

/** ref functions waiting until the page is updated. */
const refQueue = [];

/**
 * call all the ref functions that are waiting, in order.
 * @returns {void}
 */
export function flushRefs() {
    while (refQueue.length > 0) {
        const [fn, el] = refQueue.shift();
        fn(el);
    }
}

/**
 * put the attributes on a real element, and remove the old ones.
 * it runs two times: first the normal ones, then value/checked/selected
 * after the children are there (a select needs its options first).
 * @param {Element} el - the real element.
 * @param {object} oldAttrs - the old attributes ({} the first time).
 * @param {object} newAttrs - the new attributes.
 * @param {boolean} [live=false] - true to only do value/checked/selected.
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
 * set value, checked or selected on the element.
 * it only writes when it is different, so the cursor in an input does not jump.
 * @param {Element} el - the real element.
 * @param {string} name - value, checked or selected.
 * @param {*} value - the new value.
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
 * set the style. it can be text or an object like { backgroundColor: "red" }.
 * @param {HTMLElement} el - the real element.
 * @param {string|object|null|undefined} oldV - the old style.
 * @param {string|object|null|undefined} newV - the new style.
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
 * set one style property.
 * @param {HTMLElement} el - the real element.
 * @param {string} prop - like backgroundColor, or a css variable like --gap.
 * @param {string|number} value - the css value ("" removes it).
 * @returns {void}
 */
function setStyleProp(el, prop, value) {
    if (prop.includes("-")) el.style.setProperty(prop, String(value));
    else el.style[prop] = String(value);
}
