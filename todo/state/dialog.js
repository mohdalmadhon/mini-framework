import { ref } from "../../src/index.js";
import { LIMITS } from "../config/constants.js";
import { clean } from "../utils/text.js";
import { todos, updateTodo } from "./todos.js";
import { cancelEdit } from "./editing.js";

export const dialog = ref("dialog", null);

let focusRequested = false;

export function openDialog(todo) {
    cancelEdit();
    focusRequested = true;
    const { id, title, description, color, icon, files } = todo;
    dialog.value = { id, title, description, color, icon, files };
}

export function takeFocusRequest() {
    const wanted = focusRequested;
    focusRequested = false;
    return wanted;
}

export const closeDialog = () => (dialog.value = null);

export function patchDialog(patch) {
    if (dialog.value) dialog.value = { ...dialog.value, ...patch };
}

export function saveDialog() {
    const d = dialog.value;
    const title = clean(d?.title, LIMITS.title);
    if (!title) return;

    updateTodo(d.id, {
        title,
        description: clean(d.description, LIMITS.description),
        color: d.color,
        icon: d.icon,
        files: d.files.slice(0, LIMITS.files),
    });
    closeDialog();
}

export const removeDialogFile = (fileId) =>
    patchDialog({ files: (dialog.value?.files ?? []).filter((file) => file.id !== fileId) });

export const dialogFiles = {
    id: "dialog",
    get: () => dialog.value?.files ?? [],
    set: (files) => patchDialog({ files }),
    pending: () => {
        const d = dialog.value;
        if (!d) return 0;
        const saved = new Set((todos.value.find((todo) => todo.id === d.id)?.files ?? []).map((file) => file.id));
        return JSON.stringify(d.files.filter((file) => !saved.has(file.id))).length;
    },
};
