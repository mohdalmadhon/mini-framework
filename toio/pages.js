import { createElemant as h } from "../src/index.js";
import { HomeIcon, LostArt } from "./icons.js";

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

export function NotFoundPage({ path }) {
    const known = path !== "/404";
    return ErrorPage({
        message: known
            ? "We couldn't find the page you were looking for. It may have moved, or the link is wrong."
            : "This page does not exist.",
        path: known ? path : null,
    });
}
