import { normalizeChildren } from "../utils/elemant.js";
import { render } from "./render.js";
import { patchChildren } from "./diffing.js";
import { flushRefs } from "./attrs.js";
import { subscribe } from "../state/state.js";

/** the app that is running (null before build). */
let current = null;

/** true when a render is already waiting for the end of this tick. */
let scheduled = false;

/**
 * render virtual elements inside a container, one time.
 * it replaces what was inside.
 * @param {VElement|string|Array<VElement|string>} vnodes - what to show.
 * @param {Element} container - the real element to put it in.
 * @returns {Element} the container.
 */
export function mount(vnodes, container) {
    container.replaceChildren(...normalizeChildren(vnodes).map((node) => render(node)));
    flushRefs();
    return container;
}

/**
 * start the app.
 * it renders the component one time, then renders it again every time the state changes.
 * @param {function(): (VElement|Array|null)} entry - the main component.
 * @param {string|Element} [target="#app"] - a css selector or the element to put the app in.
 * @returns {void}
 * @throws {Error} when the target is not found.
 * @example
 * build(() => router.view(), "#app");
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
 * render the app again right now and update only what changed.
 * you almost never need it, changing the state does it for you.
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
 * wait for the end of the tick, so many state changes give only one render.
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
