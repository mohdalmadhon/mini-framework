/**
 * @module renderer/mount
 *
 * Mounts an app into the page and keeps it in sync with the global state.
 * This is where the control is inverted: you give the framework a component
 * function, and the framework decides when to call it again.
 */
import { VElement, normalizeChildren } from "../utils/elemant.js";
import { render } from "./render.js";
import { patchChildren } from "./diffing.js";
import { flushRefs } from "./attrs.js";
import { subscribe } from "../state/state.js";

/**
 * A component: a function returning what to show (one virtual element, or an
 * array of them).
 *
 * @callback Component
 * @returns {VElement|Array<VElement|string>|null}
 */

/**
 * @typedef {Object} AppInstance
 * @property {Component} entry - Root component.
 * @property {Element} container - The real element the app lives in.
 * @property {Array<VElement|string>} vtree - Virtual tree currently on screen.
 * @property {() => void} unsubscribe - Stops listening to state changes.
 */

/** @type {AppInstance|null} */
let current = null;
let scheduled = false;

/**
 * Renders virtual nodes into a container, replacing its content.
 * (Low level: most apps only need {@link build}.)
 *
 * @param {VElement|string|Array<VElement|string>} vnodes - What to render.
 * @param {Element} container - Real DOM element to render into.
 * @returns {Element} The container.
 */
export function mount(vnodes, container) {
    container.replaceChildren(...normalizeChildren(vnodes).map(render));
    flushRefs();
    return container;
}

/**
 * Starts the app. Renders `entry()` into the target, then re-renders
 * automatically (with a minimal DOM diff) every time the global state changes.
 *
 * @param {Component} entry - Root component.
 * @param {string|Element} [target="#app"] - CSS selector or element to mount into.
 * @returns {void}
 * @throws {Error} If the target element does not exist.
 *
 * @example
 * build(() => createElemant("h1", {}, ["Hello"]), "#app");
 */
export function build(entry, target = "#app") {
    const container =
        typeof target === "string" ? document.querySelector(target) : target;

    if (!container) {
        throw new Error(`build: mount target "${String(target)}" was not found`);
    }

    if (current) current.unsubscribe();

    const vtree = normalizeChildren([entry()]);
    mount(vtree, container);

    current = {
        entry,
        container,
        vtree,
        unsubscribe: subscribe(scheduleRender),
    };
}

/**
 * Re-runs the root component right now and patches the DOM.
 * You rarely need this: state changes call it for you.
 *
 * @returns {void}
 */
export function rerender() {
    if (!current) return;

    const next = normalizeChildren([current.entry()]);
    patchChildren(current.container, current.vtree, next);
    current.vtree = next;
    flushRefs();
}

/**
 * Batches several state changes made in the same tick into one render.
 *
 * @returns {void}
 */
function scheduleRender() {
    if (scheduled) return;
    scheduled = true;

    queueMicrotask(() => {
        scheduled = false;
        rerender();
    });
}
