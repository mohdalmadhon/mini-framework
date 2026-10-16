import { createElemant as h } from "../../src/index.js";
import { FILTERS } from "../config/constants.js";
import { todos, countLeft, clearCompleted } from "../state/todos.js";

function Counter(left) {
    return h("span", { class: "todo-count" }, [h("strong", {}, [left]), left === 1 ? " item left" : " items left"]);
}

function Filters(path) {
    return h(
        "ul",
        { class: "filters" },
        FILTERS.map((filter) =>
            h("li", {}, [h("a", { href: filter.href, class: filter.path === path ? "selected" : "" }, [filter.label])])
        )
    );
}

export function Footer({ path }) {
    const list = todos.value;
    if (list.length === 0) return null;

    const left = countLeft(list);

    return h("footer", { class: "footer" }, [
        Counter(left),
        Filters(path),
        list.length > left ? h("button", { class: "clear-completed", onClick: clearCompleted }, ["Clear completed"]) : null,
    ]);
}
