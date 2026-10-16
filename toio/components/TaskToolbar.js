import { createElemant as h } from "../../src/index.js";
import { CheckIcon } from "../icons.js";

export function TaskToolbar({ doneCount, total, onSetAll, onRemoveAll }) {
    return h("section", { class: "toolbar" }, [
        h("button", { type: "button", class: "btn", disabled: doneCount === 0, onClick: () => onSetAll(false) }, [
            "Undone all",
        ]),
        h(
            "button",
            {
                type: "button",
                class: "btn primary",
                disabled: total === 0 || doneCount === total,
                onClick: () => onSetAll(true),
            },
            ["Done all", CheckIcon(18)]
        ),
        h("button", { type: "button", class: "btn danger", disabled: total === 0, onClick: onRemoveAll }, ["Remove all"]),
    ]);
}
