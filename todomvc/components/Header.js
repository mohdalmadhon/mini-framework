import { createElemant as h } from "../../src/index.js";

export function Header({ value, onInput, onAdd }) {
    return h("header", { class: "header" }, [
        h("h1", {}, ["todos"]),
        h("input", {
            class: "new-todo",
            placeholder: "What needs to be done?",
            autofocus: true,
            autocomplete: "off",
            value,
            "aria-label": "New todo",
            onInput: (event) => onInput(event.target.value),
            onKeyDown: (event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    onAdd();
                }
            },
        }),
    ]);
}
