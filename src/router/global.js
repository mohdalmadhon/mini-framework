/** Holds the active router. */

/** The router created last (`null` before `new Router(...)`). */
export let router = null;

/**
 * Registers the active router.
 * @param {module:router/router.Router} instance - The router to register.
 * @returns {void}
 */
export function setRouter(instance) {
    router = instance;
}

/**
 * Returns the active router.
 * @returns {module:router/router.Router|null} The router, or `null` if none was created yet.
 */
export function getRouter() {
    return router;
}
