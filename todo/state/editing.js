import { ref } from "../../src/index.js";
import { LIMITS } from "../config/constants.js";
import { clean } from "../utils/text.js";
import { updateTodo, removeTodo } from "./todos.js";

export const editing = ref("editing", null);

export const draft = ref("draft", "");

export function startEdit(todo) {
    draft.value = todo.title;
    editing.value = todo.id;
}

export function commitEdit(id) {
    if (editing.value !== id) return;
    const title = clean(draft.value, LIMITS.title);
    editing.value = null;
    if (title) updateTodo(id, { title });
    else removeTodo(id);
}

export function cancelEdit() {
    editing.value = null;
}
