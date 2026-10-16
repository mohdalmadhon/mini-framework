import { createElemant as h } from "../../src/index.js";
import { LIMITS } from "../config/constants.js";
import { inkFor } from "../utils/color.js";
import { composer, patchComposer, toggleDetails, submitComposer, composerFiles, removeComposerFile } from "../state/composer.js";
import { taskIcon } from "../icons/task-icons.js";
import { ChevronIcon, PaperclipIcon } from "../icons/ui-icons.js";
import { CharCount } from "./fields/CharCount.js";
import { TextField } from "./fields/TextField.js";
import { ColorPicker } from "./fields/ColorPicker.js";
import { IconPicker } from "./fields/IconPicker.js";
import { FileDrop } from "./fields/FileDrop.js";

function Preview(form) {
    return h("span", { class: "composer-preview", style: { background: form.color, color: inkFor(form.color) } }, [
        form.icon ? taskIcon(form.icon, 18) : null,
        form.files.length > 0 ? h("span", { class: "preview-files" }, [PaperclipIcon(12), String(form.files.length)]) : null,
    ]);
}

function DetailsPanel(form) {
    return h("div", { class: "composer-panel", id: "composer-panel" }, [
        TextField({
            id: "new-description",
            label: "Description",
            value: form.description,
            max: LIMITS.description,
            multiline: true,
            placeholder: "Optional notes",
            onInput: (description) => patchComposer({ description }),
        }),
        ColorPicker(form.color, (color) => patchComposer({ color })),
        IconPicker(form.icon, (icon) => patchComposer({ icon })),
        FileDrop(composerFiles, removeComposerFile),
        h("div", { class: "panel-actions" }, [
            h("button", { type: "button", class: "btn primary", disabled: !form.title.trim(), onClick: submitComposer }, [
                form.title.trim() ? "Add todo" : "Type a title first",
            ]),
        ]),
    ]);
}

export function Composer() {
    const form = composer.value;

    return h("div", { key: "composer", class: "composer" }, [
        h("div", { class: "composer-bar" }, [
            CharCount(form.title.length, LIMITS.title),
            h("div", { class: "composer-tools" }, [
                Preview(form),
                h(
                    "button",
                    {
                        type: "button",
                        class: form.open ? "details-toggle open" : "details-toggle",
                        "aria-expanded": String(form.open),
                        "aria-controls": "composer-panel",
                        onClick: toggleDetails,
                    },
                    [form.open ? "Hide details" : "Add details", ChevronIcon(16)]
                ),
            ]),
        ]),
        form.open ? DetailsPanel(form) : null,
    ]);
}
