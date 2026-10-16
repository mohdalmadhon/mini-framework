import { createElemant as h } from "../../../src/index.js";
import { SWATCHES } from "../../config/constants.js";

export function ColorPicker(value, onPick) {
    const isCustom = !SWATCHES.includes(value);

    return h("div", { class: "field", role: "radiogroup", "aria-label": "Color" }, [
        h("span", { class: "field-label" }, ["Color"]),
        h("div", { class: "swatches" }, [
            ...SWATCHES.map((color) =>
                h("button", {
                    key: color,
                    type: "button",
                    class: color === value ? "swatch selected" : "swatch",
                    style: { backgroundColor: color },
                    role: "radio",
                    "aria-checked": String(color === value),
                    "aria-label": `Color ${color}`,
                    onClick: () => onPick(color),
                })
            ),
            h(
                "label",
                {
                    key: "custom",
                    class: isCustom ? "swatch custom selected" : "swatch custom",
                    title: "Any color",
                    style: isCustom ? { background: value } : null,
                },
                [
                    h("input", {
                        class: "sr-only",
                        type: "color",
                        "aria-label": "Pick any color",
                        value,
                        onInput: (event) => onPick(event.target.value),
                    }),
                ]
            ),
        ]),
    ]);
}
