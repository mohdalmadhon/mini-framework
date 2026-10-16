import { createElemant as h } from "../../src/index.js";
import { ENTER_KEY, ESCAPE_KEY, LIMITS } from "../config/constants.js";
import { inkFor } from "../utils/color.js";
import { toggleTodo, removeTodo } from "../state/todos.js";
import { editing, draft, startEdit, commitEdit, cancelEdit } from "../state/editing.js";
import { openDialog } from "../state/dialog.js";
import { taskIcon, taskIconLabel } from "../icons/task-icons.js";
import { MoreIcon } from "../icons/ui-icons.js";
import { FileList } from "./fields/FileList.js";

function focusOnce(input) {
    if (document.activeElement === input) return;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
}

function EditField(todo) {
    return h("input", {
        class: "edit",
        value: draft.value,
        maxlength: String(LIMITS.title),
        "aria-label": "Edit todo",
        onInput: (event) => {
            draft.value = event.target.value;
        },
        onBlur: () => commitEdit(todo.id),
        onKeyDown: (event) => {
            if (event.key === ENTER_KEY) commitEdit(todo.id);
            else if (event.key === ESCAPE_KEY) cancelEdit();
        },
        ref: focusOnce,
    });
}

function Extra(todo) {
    if (!todo.description && todo.files.length === 0) return null;

    return h("div", { class: "todo-extra", onClick: () => openDialog(todo) }, [
        todo.description ? h("p", { class: "todo-desc" }, [todo.description]) : null,
        todo.files.length > 0 ? FileList(todo.files) : null,
    ]);
}

export function TodoItem(todo) {
    const isEditing = editing.value === todo.id;
    const className = [todo.completed ? "completed" : "", isEditing ? "editing" : ""].join(" ").trim();

    return h(
        "li",
        {
            key: todo.id,
            "data-id": todo.id,
            class: className,
            style: { "--todo-color": todo.color, "--todo-ink": inkFor(todo.color) },
        },
        [
            h("div", { class: "view" }, [
                h("input", {
                    class: "toggle",
                    type: "checkbox",
                    checked: todo.completed,
                    onChange: () => toggleTodo(todo.id),
                }),
                todo.icon
                    ? h("span", { class: "todo-icon", role: "img", "aria-label": taskIconLabel(todo.icon) }, [
                          taskIcon(todo.icon, 26),
                      ])
                    : null,
                h("label", { onDblClick: () => startEdit(todo) }, [todo.title]),
                h(
                    "button",
                    {
                        class: "todo-more",
                        "aria-label": `Details of ${todo.title}`,
                        title: "Details",
                        onClick: () => openDialog(todo),
                    },
                    [MoreIcon(18)]
                ),
                h("button", { class: "destroy", "aria-label": `Delete ${todo.title}`, onClick: () => removeTodo(todo.id) }),
            ]),
            isEditing ? EditField(todo) : Extra(todo),
        ]
    );
}
