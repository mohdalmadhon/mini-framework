import { createElemant as h } from "../../src/index.js";
import { ENTER_KEY, LIMITS } from "../config/constants.js";
import { composer, patchComposer, submitComposer } from "../state/composer.js";

export function Header() {
    return h("header", { class: "header" }, [
        h("h1", {}, ["todos"]),
        h("input", {
            class: "new-todo",
            placeholder: "What needs to be done?",
            autofocus: true,
            maxlength: String(LIMITS.title),
            value: composer.value.title,
            onInput: (event) => patchComposer({ title: event.target.value }),
            onKeyDown: (event) => {
                if (event.key === ENTER_KEY && !event.isComposing) submitComposer();
            },
        }),
    ]);
}
