/**
 * Error pages of TOIO, shown by the framework router.
 */
import { createElemant as h } from "../src/index.js";
import { HomeIcon, LostArt } from "./icons.js";

/**
 * Full-page error screen with a "Back to home" link.
 *
 * @param {Object} props
 * @param {string} [props.code="404"] - Big text on top.
 * @param {string} [props.title="Page not found"]
 * @param {string} props.message - Short explanation.
 * @param {string|null} [props.path] - The path that was not found.
 * @param {boolean} [props.crash=false] - `true` when the app itself failed (adds a Reload button).
 * @returns {import("../src/index.js").VElement}
 */
export function ErrorPage({ code = "404", title = "Page not found", message, path = null, crash = false }) {
    return h("main", { class: "error-page" }, [
        h("div", { class: "error-card", role: "alert" }, [
            h("div", { class: "error-art" }, [LostArt(150)]),
            h("p", { class: "error-code" }, [code]),
            h("h1", { class: "error-title" }, [title]),
            h("p", { class: "error-msg" }, [message]),
            path ? h("p", { class: "error-path" }, [h("code", {}, [`#${path}`])]) : null,
            h("div", { class: "error-actions" }, [
                h(
                    "a",
                    {
                        class: "btn primary",
                        href: "#/",
                        onClick: () => {
                            // the hash may already be "#/": reload so the app starts again
                            if (crash) window.setTimeout(() => window.location.reload(), 0);
                        },
                    },
                    [HomeIcon(18), "Back to home"]
                ),
                crash
                    ? h("button", { type: "button", class: "btn", onClick: () => window.location.reload() }, ["Reload"])
                    : h("button", { type: "button", class: "btn", onClick: () => window.history.back() }, ["Go back"]),
            ]),
        ]),
    ]);
}

/**
 * Route component for unknown paths (`"/404"` of the router).
 *
 * @param {{ path: string }} context
 * @returns {import("../src/index.js").VElement}
 */
export function NotFoundPage({ path }) {
    const known = path !== "/404";
    return ErrorPage({
        message: known
            ? "We couldn't find the page you were looking for. It may have moved, or the link is wrong."
            : "This page does not exist.",
        path: known ? path : null,
    });
}
