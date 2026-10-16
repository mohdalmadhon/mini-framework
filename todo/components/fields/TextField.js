import { createElemant as h } from "../../../src/index.js";
import { ENTER_KEY } from "../../config/constants.js";
import { CharCount } from "./CharCount.js";

export function TextField({ id, label, value, max, onInput, multiline = false, placeholder = "", onEnter, shouldFocus }) {
    const attrs = {
        id,
        class: multiline ? "text-area" : "text-input",
        maxlength: String(max),
        placeholder,
        value,
        onInput: (event) => onInput(event.target.value),
        ref: (el) => {
            if (shouldFocus?.()) el.focus();
        },
    };

    if (multiline) attrs.rows = "3";
    else if (onEnter) {
        attrs.onKeyDown = (event) => {
            if (event.key === ENTER_KEY && !event.isComposing) onEnter();
        };
    }

    return h("div", { class: "field" }, [
        h("div", { class: "field-head" }, [
            h("label", { class: "field-label", for: id }, [label]),
            CharCount(value.length, max),
        ]),
        h(multiline ? "textarea" : "input", attrs),
    ]);
}
