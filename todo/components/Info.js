import { createElemant as h } from "../../src/index.js";

export function Info() {
    return h("footer", { key: "info", class: "info" }, [
        h("p", {}, ["Double-click to edit a todo"]),
        h("p", {}, ["Created with mini-framework"]),
        h("p", {}, ["Part of ", h("a", { href: "http://todomvc.com" }, ["TodoMVC"])]),
    ]);
}
