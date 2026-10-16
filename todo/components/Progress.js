import { createElemant as h } from "../../src/index.js";
import { todos, countLeft } from "../state/todos.js";

function cheer(percent) {
    if (percent === 100) return "Everything done!";
    if (percent >= 75) return "Almost there!";
    if (percent >= 50) return "Halfway!";
    if (percent > 0) return "Good start!";
    return "Let's begin!";
}

export function Progress() {
    const list = todos.value;

    if (list.length === 0) {
        return h("p", { key: "progress", class: "empty-hint" }, [
            "Nothing to do yet. Type above and press Enter.",
        ]);
    }

    const done = list.length - countLeft(list);
    const percent = Math.round((done / list.length) * 100);

    return h("div", { key: "progress", class: percent === 100 ? "progress full" : "progress" }, [
        h("div", { class: "progress-text" }, [
            h("span", {}, [h("strong", {}, [done]), ` of ${list.length} done`]),
            h("span", { class: "progress-cheer" }, [cheer(percent)]),
        ]),
        h(
            "div",
            {
                class: "progress-track",
                role: "progressbar",
                "aria-label": "Todos done",
                "aria-valuemin": "0",
                "aria-valuemax": "100",
                "aria-valuenow": String(percent),
            },
            [h("div", { class: "progress-fill", style: { width: `${percent}%` } })]
        ),
    ]);
}
