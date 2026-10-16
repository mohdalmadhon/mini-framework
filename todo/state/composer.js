import { ref } from "../../src/index.js";
import { addTodo, nextColor } from "./todos.js";

const emptyForm = () => ({ open: false, title: "", description: "", color: nextColor(), icon: null, files: [] });

export const composer = ref("composer", emptyForm());

export function patchComposer(patch) {
    composer.value = { ...composer.value, ...patch };
}

export const toggleDetails = () => patchComposer({ open: !composer.value.open });

export function submitComposer() {
    if (addTodo(composer.value)) composer.value = emptyForm();
}

export const removeComposerFile = (fileId) =>
    patchComposer({ files: composer.value.files.filter((file) => file.id !== fileId) });

export const composerFiles = {
    id: "composer",
    get: () => composer.value.files,
    set: (files) => patchComposer({ files }),
    pending: () => JSON.stringify(composer.value.files).length,
};
