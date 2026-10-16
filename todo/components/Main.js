import { createElemant as h } from "../../src/index.js";
import { todos, visibleTodos, countLeft, toggleAll } from "../state/todos.js";
import { TodoItem } from "./TodoItem.js";

export function Main({ path }) {
    const list = todos.value;
    if (list.length === 0) return null;

    return h("main", { class: "main" }, [
        h("div", { class: "toggle-all-container" }, [
            h("input", {
                id: "toggle-all",
                class: "toggle-all",
                type: "checkbox",
                checked: countLeft(list) === 0,
                onChange: toggleAll,
            }),
            h("label", { class: "toggle-all-label", for: "toggle-all" }, ["Mark all as complete"]),
        ]),
        h("ul", { class: "todo-list" }, visibleTodos(list, path).map(TodoItem)),
    ]);
}
