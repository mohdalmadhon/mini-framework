import { createElemant as h } from "../../../src/index.js";
import { TASK_ICON_NAMES, taskIcon, taskIconLabel } from "../../icons/task-icons.js";
import { NoneIcon } from "../../icons/ui-icons.js";

function Choice(name, selected, onPick) {
    const label = name ? taskIconLabel(name) : "No icon";

    return h(
        "button",
        {
            key: name ?? "none",
            type: "button",
            class: selected ? "icon-choice selected" : "icon-choice",
            role: "radio",
            "aria-checked": String(selected),
            "aria-label": label,
            title: label,
            onClick: () => onPick(name),
        },
        [name ? taskIcon(name, 26) : NoneIcon(20)]
    );
}

export function IconPicker(value, onPick) {
    return h("div", { class: "field", role: "radiogroup", "aria-label": "Icon" }, [
        h("span", { class: "field-label" }, ["Icon"]),
        h("div", { class: "icon-grid" }, [
            Choice(null, value === null, onPick),
            ...TASK_ICON_NAMES.map((name) => Choice(name, value === name, onPick)),
        ]),
    ]);
}
