/** Mounts an app into the page and keeps it in sync with the global state. */
import { VElement, normalizeChildren } from "../utils/elemant.js";
import { render } from "./render.js";
import { patchChildren } from "./diffing.js";
import { flushRefs } from "./attrs.js";
import { subscribe } from "../state/state.js";

/**
 * A component: a function returning what to show (one virtual element, or an array of them).
 * @returns {VElement|Array<VElement|string>|null}
 */

/** Everything the framework remembers about the running app. */

/** The running app (`null` before {@link module:renderer/mount.build} is called). */
let current = null;

/** `true` while a render is already queued for the end of the current tick. */
let scheduled = false;

/**
 * Renders virtual nodes into a container, replacing its content.
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
 * Starts the app.
 * @param {Component} entry - Root component.
 * @param {string|Element} [target="#app"] - CSS selector or element to mount into.
 * @returns {void}
 * @throws {Error} If the target element does not exist.
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
 * Batches several state changes made in the same tick into one render, using a microtask.
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
