/** Hash based routing (`index.html#/about`). */
import { getState, setState, initState } from "../state/state.js";
import { on } from "../utils/events.js";
import { setRouter } from "./global.js";

/** State key that holds the current path. */
export const ROUTE_KEY = "__route__";

/** Data given to a route component. */

/**
 * A function that returns the virtual tree of one route.
 * @param {RouteContext} context
 * @returns {module:utils/elemant.VElement|Array<any>|null}
 */

/** Hash router. */
export class Router {
    /**
     * Creates the router, reads the current hash into the state and starts listening to hash changes.
     * @param {Object<string, RouteComponent>} routes - Map of path pattern to component. Use `:name` for variable segments. `"/404"` is used for unknown paths.
     */
    constructor(routes) {
        /** The route table given to the constructor. */
        this.routes = routes;

        /** The route table pre-split into segments, so matching is fast. */
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

    /** Current path, read from the global state. */
    get path() {
        return getState(ROUTE_KEY, "/");
    }

    /**
     * Copies the URL hash into the state (called on every `hashchange`).
     * @returns {void}
     */
    sync() {
        setState(ROUTE_KEY, readHash());
    }

    /**
     * Changes the URL, and therefore the state and the page.
     * @param {string} path - e.g. `"/about"`.
     * @returns {void}
     */
    navigate(path) {
        window.location.hash = path;
        this.sync();
    }

    /**
     * Finds the route matching a path.
     * @param {string} path - Path to look up (a `?query` part is ignored).
     * @returns {{component: RouteComponent, params: Object<string, string>}|null} The matching component and its `:name` values, or `null` if no route matches.
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
     * Returns the virtual tree of the current route.
     * @returns {module:utils/elemant.VElement|Array<any>|null} The tree, or `null` when there is no matching route and no `"/404"` route.
     */
    view() {
        const path = this.path;
        const found = this.match(path) ?? this.match("/404");

        if (!found) return null;

        return found.component({ path, params: found.params, router: this });
    }
}

/**
 * Splits a path into its non-empty segments, ignoring any `?query`.
 * @param {string} path - A path or a route pattern.
 * @returns {string[]} Non-empty segments (`"/a/b/"` gives `["a", "b"]`).
 */
function splitPath(path) {
    return path.split("?")[0].split("/").filter(Boolean);
}

/**
 * Reads the current path out of `location.hash`.
 * @returns {string} The path stored in `location.hash` (`"/"` when empty).
 */
function readHash() {
    const raw = window.location.hash.slice(1).split("?")[0];
    if (!raw) return "/";
    return raw.startsWith("/") ? raw : `/${raw}`;
}
