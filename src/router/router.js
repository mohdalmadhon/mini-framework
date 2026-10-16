import { getState, setState, initState } from "../state/state.js";
import { on } from "../utils/events.js";
import { setRouter } from "./global.js";

/** the state key that has the path now. */
export const ROUTE_KEY = "__route__";

/**
 * hash router (index.html#/about).
 * the path is kept in the global state, so the url and the state are always the same.
 * @example
 * const router = new Router({ "/": Home, "/user/:id": User, "/404": NotFound });
 * build(() => router.view(), "#app");
 */
export class Router {
    /**
     * make the router, read the hash and listen when it changes.
     * @param {Object<string, function>} routes - path to component. use :name for a part that changes, "/404" is used when nothing matches.
     */
    constructor(routes) {
        /** the routes you gave. */
        this.routes = routes;

        /** the routes already split in parts, so matching is fast. */
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
     * the path now, from the state.
     * @returns {string}
     */
    get path() {
        return getState(ROUTE_KEY, "/");
    }

    /**
     * copy the hash into the state (runs on every hashchange).
     * @returns {void}
     */
    sync() {
        setState(ROUTE_KEY, readHash());
    }

    /**
     * go to another path from the code.
     * @param {string} path - like "/about".
     * @returns {void}
     */
    navigate(path) {
        window.location.hash = path;
        this.sync();
    }

    /**
     * find the route of a path.
     * @param {string} path - the path (a ?query part is ignored).
     * @returns {{component: function, params: Object<string, string>}|null} the component and the :name values, or null.
     */
    match(path) {
        const parts = splitPath(path);

        for (const route of this.compiled) {
            if (route.segments.length !== parts.length) continue;

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
     * get the page of the path now.
     * the component gets { path, params, router }.
     * @returns {VElement|Array|null} the page, or null if nothing matches and there is no "/404".
     */
    view() {
        const path = this.path;
        const found = this.match(path) ?? this.match("/404");

        if (!found) return null;

        return found.component({ path, params: found.params, router: this });
    }
}

/**
 * split a path in parts and drop the empty ones and the ?query.
 * @param {string} path - a path or a route.
 * @returns {string[]} the parts ("/a/b/" gives ["a", "b"]).
 */
function splitPath(path) {
    return path.split("?")[0].split("/").filter(Boolean);
}

/**
 * read the path from location.hash.
 * @returns {string} the path ("/" when the hash is empty).
 */
function readHash() {
    const raw = window.location.hash.slice(1).split("?")[0];
    if (!raw) return "/";
    return raw.startsWith("/") ? raw : `/${raw}`;
}
