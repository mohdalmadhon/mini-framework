import { createElemant as h } from "../../../src/index.js";
import { TodoItem } from "./TodoItem.js";

export function Main({
    todos,
    allCompleted,
    editingId,
    editingTitle,
    onToggleAll,
    onToggle,
    onRemove,
    onStartEdit,
    onUpdateEdit,
    onSaveEdit,
    onCancelEdit,
}) {
    return h("section", { class: "main" }, [
        h("input", {
            id: "toggle-all",
            class: "toggle-all",
            type: "checkbox",
            checked: allCompleted,
            "aria-label": "Mark all as complete",
            onChange: (event) => onToggleAll(event.target.checked),
        }),
        h("label", { for: "toggle-all" }, ["Mark all as complete"]),
        h(
            "ul",
            { class: "todo-list" },
            todos.map((todo) =>
                TodoItem({
                    todo,
                    editing: editingId === todo.id,
                    title: editingTitle,
                    onToggle,
                    onRemove,
                    onStartEdit,
                    onUpdateEdit,
                    onSaveEdit,
                    onCancelEdit,
                })
            )
        ),
    ]);
}
