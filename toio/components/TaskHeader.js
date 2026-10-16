import { createElemant as h } from "../../src/index.js";
import { Logo, PlusIcon } from "../icons.js";

export function TaskHeader({ doneCount, total, percent, formOpen, onAdd, dateLabel }) {
    return h("header", { class: "top" }, [
        h("div", { class: "brand", title: "TOIO" }, [Logo(54)]),
        h("div", { class: "top-text" }, [
            h("h1", {}, [h("span", { class: "today" }, ["Today"]), ` ${dateLabel}`]),
            h("p", { class: "summary" }, [`${doneCount} of ${total} done`]),
            h(
                "div",
                {
                    class: "progress",
                    role: "progressbar",
                    "aria-label": "Tasks done",
                    "aria-valuemin": "0",
                    "aria-valuemax": "100",
                    "aria-valuenow": String(percent),
                },
                [h("div", { class: "progress-bar", style: { width: `${percent}%` } })]
            ),
        ]),
        h(
            "button",
            {
                type: "button",
                class: formOpen ? "add-btn open" : "add-btn",
                "aria-label": "Add a task",
                title: "Add a task (n)",
                onClick: onAdd,
            },
            [PlusIcon()]
        ),
    ]);
}
