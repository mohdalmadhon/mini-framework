import { createElemant as h } from "../../src/index.js";
import { notice, runUndo, dismissNotice } from "../state/notice.js";
import { CloseIcon, UndoIcon } from "../icons/ui-icons.js";

export function Toast() {
    const toast = notice.value;
    if (!toast) return null;

    return h("div", { key: `toast-${toast.id}`, class: "toast", role: "status", "aria-live": "polite" }, [
        h("span", { class: "toast-text" }, [toast.text]),
        toast.undoable ? h("button", { type: "button", class: "toast-btn", onClick: runUndo }, [UndoIcon(16), "Undo"]) : null,
        h("button", { type: "button", class: "toast-x", "aria-label": "Dismiss", onClick: dismissNotice }, [CloseIcon(12)]),
    ]);
}
