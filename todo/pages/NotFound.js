import { createElemant as h } from "../../src/index.js";
import { HomeIcon, LostArt } from "../icons/ui-icons.js";

export function NotFoundPage({ path }) {
    const unknown = path !== "/404";

    return h("main", { class: "error-page" }, [
        h("div", { class: "error-card", role: "alert" }, [
            h("div", { class: "error-art" }, [LostArt(150)]),
            h("p", { class: "error-code" }, ["404"]),
            h("h1", { class: "error-title" }, ["Page not found"]),
            h("p", { class: "error-msg" }, [
                unknown
                    ? "We couldn't find the page you were looking for. The link may be wrong."
                    : "This page does not exist.",
            ]),
            unknown ? h("p", { class: "error-path" }, [h("code", {}, [`#${path}`])]) : null,
            h("div", { class: "error-actions" }, [
                h("a", { class: "btn primary", href: "#/" }, [HomeIcon(18), "Back to the list"]),
            ]),
        ]),
    ]);
}
