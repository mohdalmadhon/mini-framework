import { createElemant as h } from "../../src/index.js";
import { LIMITS } from "../config/constants.js";
import { inkFor } from "../utils/color.js";
import {
    dialog,
    closeDialog,
    patchDialog,
    saveDialog,
    takeFocusRequest,
    dialogFiles,
    removeDialogFile,
} from "../state/dialog.js";
import { taskIcon } from "../icons/task-icons.js";
import { CloseIcon } from "../icons/ui-icons.js";
import { TextField } from "./fields/TextField.js";
import { ColorPicker } from "./fields/ColorPicker.js";
import { IconPicker } from "./fields/IconPicker.js";
import { FileDrop } from "./fields/FileDrop.js";

export function TaskDialog() {
    const d = dialog.value;
    if (!d) return null;

    return h(
        "div",
        {
            key: "dialog",
            class: "overlay",
            onClick: (event) => {
                if (event.target === event.currentTarget) closeDialog();
            },
        },
        [
            h(
                "div",
                {
                    class: "dialog",
                    role: "dialog",
                    "aria-modal": "true",
                    "aria-labelledby": "dialog-title",
                    style: { "--todo-color": d.color, "--todo-ink": inkFor(d.color) },
                },
                [
                    h("div", { class: "dialog-head" }, [
                        d.icon ? h("span", { class: "todo-icon" }, [taskIcon(d.icon, 28)]) : null,
                        h("h2", { id: "dialog-title" }, ["Todo details"]),
                        h("button", { type: "button", class: "icon-btn", "aria-label": "Close", onClick: closeDialog }, [
                            CloseIcon(16),
                        ]),
                    ]),
                    TextField({
                        id: "dialog-title-input",
                        label: "Title",
                        value: d.title,
                        max: LIMITS.title,
                        onInput: (title) => patchDialog({ title }),
                        onEnter: saveDialog,
                        shouldFocus: takeFocusRequest,
                    }),
                    TextField({
                        id: "dialog-description",
                        label: "Description",
                        value: d.description,
                        max: LIMITS.description,
                        multiline: true,
                        placeholder: "Optional notes",
                        onInput: (description) => patchDialog({ description }),
                    }),
                    ColorPicker(d.color, (color) => patchDialog({ color })),
                    IconPicker(d.icon, (icon) => patchDialog({ icon })),
                    FileDrop(dialogFiles, removeDialogFile),
                    h("div", { class: "panel-actions" }, [
                        h("button", { type: "button", class: "btn", onClick: closeDialog }, ["Cancel"]),
                        h("button", { type: "button", class: "btn primary", disabled: !d.title.trim(), onClick: saveDialog }, [
                            "Save",
                        ]),
                    ]),
                ]
            ),
        ]
    );
}
