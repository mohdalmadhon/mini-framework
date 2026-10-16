import { createElemant as h } from "../../../src/index.js";

const FILTERS = [
    ["/", "All"],
    ["/active", "Active"],
    ["/completed", "Completed"],
];

export function Footer({ activeCount, completedCount, path, onClearCompleted }) {
    return h("footer", { class: "footer" }, [
        h("span", { class: "todo-count" }, [
            h("strong", {}, [String(activeCount)]),
            ` ${activeCount === 1 ? "item" : "items"} left`,
        ]),
        h(
            "ul",
            { class: "filters" },
            FILTERS.map(([route, label]) =>
                h("li", {}, [h("a", { href: `#${route}`, class: path === route ? "selected" : null }, [label])])
            )
        ),
        completedCount > 0
            ? h("button", { class: "clear-completed", type: "button", onClick: onClearCompleted }, ["Clear completed"])
            : null,
    ]);
}
