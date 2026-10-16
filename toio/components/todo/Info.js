import { createElemant as h } from "../../../src/index.js";

export function Info() {
    return h("footer", { class: "info" }, [
        h("p", {}, ["Double-click to edit a todo"]),
        h("p", {}, ["Created with toio"]),
    ]);
}
