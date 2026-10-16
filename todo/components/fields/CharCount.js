import { createElemant as h } from "../../../src/index.js";

export function CharCount(length, max) {
    return h("span", { class: length >= max * 0.9 ? "char-count warn" : "char-count" }, [`${length}/${max}`]);
}
