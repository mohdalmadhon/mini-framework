import { createElemant as h } from "../../src/index.js";

export function TodoItem({ todo, editing, title, onToggle, onRemove, onStartEdit, onUpdateEdit, onSaveEdit, onCancelEdit }) {
    return h(
        "li",
        {
            key: todo.id,
            class: [todo.completed ? "completed" : "", editing ? "editing" : ""].filter(Boolean).join(" "),
        },
        [
            h("div", { class: "view" }, [
                h("input", {
                    class: "toggle",
                    type: "checkbox",
                    checked: todo.completed,
                    "aria-label": `Mark ${todo.title} ${todo.completed ? "active" : "completed"}`,
                    onChange: () => onToggle(todo.id),
                }),
                h("label", { onDblClick: () => onStartEdit(todo) }, [todo.title]),
                h("button", { class: "destroy", type: "button", "aria-label": `Delete ${todo.title}`, onClick: () => onRemove(todo.id) }, []),
            ]),
            editing
                ? h("input", {
                      class: "edit",
                      value: title,
                      "aria-label": `Edit ${todo.title}`,
                      onInput: (event) => onUpdateEdit(event.target.value),
                      onKeyDown: (event) => {
                          if (event.key === "Enter") {
                              event.preventDefault();
                              onSaveEdit(todo.id);
                          } else if (event.key === "Escape") {
                              onCancelEdit();
                          }
                      },
                      onBlur: () => onSaveEdit(todo.id),
                      ref: (element) => element.focus(),
                  })
                : null,
        ]
    );
}
