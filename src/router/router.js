/**
 * @module router/router
 *
 * Hash based routing (`index.html#/about`). The current path is stored in the
 * global state, so changing the URL changes the state and re-renders the app,
 * and navigating from code changes the URL.
 */
import { getState, setState, initState } from "../state/state.js";
import { on } from "../utils/events.js";
import { setRouter } from "./global.js";

/** State key that holds the current path. */
export const ROUTE_KEY = "__route__";

/**
 * Data given to a route component.
 *
 * @typedef {Object} RouteContext
 * @property {string} path - Current path (`"/user/42"`).
 * @property {Object<string, string>} params - Values of `:name` segments (`{ id: "42" }`).
 * @property {Router} router - The router.
 */

/**
 * @callback RouteComponent
 * @param {RouteContext} context
 * @returns {import("../utils/elemant.js").VElement|Array<any>|null}
 */

/**
 * Hash router.
 *
 * @class
 *
 * @example
 * const router = new Router({
 *     "/": Home,
 *     "/user/:id": ({ params }) => createElemant("p", {}, ["User " + params.id]),
 *     "/404": NotFound,
 * });
 * build(() => router.view());
 */
export class Router {
    /**
     * @param {Object<string, RouteComponent>} routes - Map of path pattern to component.
     *        Use `:name` for variable segments. `"/404"` is used for unknown paths.
     */
    constructor(routes) {
        /** @type {Object<string, RouteComponent>} */
        this.routes = routes;

        /** @private */
        this.compiled = Object.entries(routes).map(([pattern, component]) => ({
            pattern,
            component,
            segments: splitPath(pattern),
        }));

        initState(ROUTE_KEY, readHash());
        on("hashchange", () => this.sync(), window);
        setRouter(this);
        this.sync();
    }

    /**
     * Current path, read from the global state.
     *
     * @type {string}
     */
    get path() {
        return getState(ROUTE_KEY, "/");
    }

    /**
     * Copies the URL hash into the state (called on every `hashchange`).
     *
     * @returns {void}
     */
    sync() {
        setState(ROUTE_KEY, readHash());
    }

    /**
     * Changes the URL, and therefore the state and the page.
     *
     * @param {string} path - e.g. `"/about"`.
     * @returns {void}
     */
    navigate(path) {
        window.location.hash = path;
        this.sync();
    }

    /**
     * Finds the route matching a path.
     *
     * @param {string} path
     * @returns {{component: RouteComponent, params: Object<string, string>}|null}
     */
    match(path) {
        const parts = splitPath(path);

        for (const route of this.compiled) {
            if (route.segments.length !== parts.length) continue;

            /** @type {Object<string, string>} */
            const params = {};
            const ok = route.segments.every((segment, i) => {
                if (segment.startsWith(":")) {
                    params[segment.slice(1)] = decodeURIComponent(parts[i]);
                    return true;
                }
                return segment === parts[i];
            });

            if (ok) return { component: route.component, params };
        }

        return null;
    }

    /**
     * Returns the virtual tree of the current route. Call it from your root
     * component; because it reads the state, the page re-renders when the
     * route changes.
     *
     * @returns {import("../utils/elemant.js").VElement|Array<any>|null}
     */
    view() {
        const path = this.path;
        const found = this.match(path) ?? this.match("/404");

        if (!found) return null;

        return found.component({ path, params: found.params, router: this });
    }
}

/**
 * @param {string} path
 * @returns {string[]} Non-empty segments (`"/a/b/"` gives `["a", "b"]`).
 */
function splitPath(path) {
    return path.split("?")[0].split("/").filter(Boolean);
}

/**
 * @returns {string} The path stored in `location.hash` (`"/"` when empty).
 */
function readHash() {
    const raw = window.location.hash.slice(1).split("?")[0];
    if (!raw) return "/";
    return raw.startsWith("/") ? raw : `/${raw}`;
}
