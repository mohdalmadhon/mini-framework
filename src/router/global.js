/**
 * @module router/global
 *
 * Holds the active router so any file can reach it with
 * `import { router } from ".../router/global.js"`.
 */

/**
 * The router created last (`null` before `new Router(...)`).
 *
 * @type {import("./router.js").Router|null}
 */
export let router = null;

/**
 * Registers the active router. Called by the `Router` constructor.
 *
 * @param {import("./router.js").Router} instance
 * @returns {void}
 */
export function setRouter(instance) {
    router = instance;
}

/**
 * @returns {import("./router.js").Router|null}
 */
export function getRouter() {
    return router;
}
