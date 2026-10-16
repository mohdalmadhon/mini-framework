import { ref } from "../../src/index.js";

export const notice = ref("notice", null);

let timer = 0;
let undoAction = null;

export function dismissNotice() {
    clearTimeout(timer);
    undoAction = null;
    notice.value = null;
}

export function notify(text, onUndo = null) {
    clearTimeout(timer);
    undoAction = onUndo;
    notice.value = { id: Date.now(), text, undoable: Boolean(onUndo) };
    timer = setTimeout(dismissNotice, onUndo ? 6000 : 3500);
}

export function runUndo() {
    const action = undoAction;
    dismissNotice();
    action?.();
}
