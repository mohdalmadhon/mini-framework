/** the last router that was made (null before new Router). */
export let router = null;

/**
 * save the router so any file can get it.
 * @param {import("./router.js").Router} instance - the router.
 * @returns {void}
 */
export function setRouter(instance) {
    router = instance;
}

/**
 * get the router.
 * @returns {import("./router.js").Router|null} the router, or null if there is none yet.
 */
export function getRouter() {
    return router;
}
