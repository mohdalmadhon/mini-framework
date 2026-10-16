/**
 * SVG icons for TOIO, drawn with the framework itself (`createElemant`).
 * Task icons use a 48x48 viewBox; UI icons use 24x24 and `currentColor`.
 */
import { createElemant as h } from "../src/index.js";

const INK = "#1f3a3d";

/**
 * Wraps shapes in an outlined 48x48 `<svg>`.
 *
 * @param {number} size - Width and height in px.
 * @param {Array<import("../src/index.js").VElement>} shapes - Drawn shapes.
 * @returns {import("../src/index.js").VElement}
 */
function art(size, shapes) {
    return h(
        "svg",
        {
            class: "icon-art",
            viewBox: "0 0 48 48",
            width: size,
            height: size,
            fill: "none",
            stroke: INK,
            "stroke-width": 2.2,
            "stroke-linejoin": "round",
            "stroke-linecap": "round",
            "aria-hidden": "true",
        },
        shapes
    );
}

/**
 * Task icons, by name. Each value draws the icon at a given size.
 *
 * @type {Object<string, (size?: number) => import("../src/index.js").VElement>}
 */
export const ICONS = {
    plant: (s = 44) =>
        art(s, [
            h("path", { d: "M24 28C14 26 10 16 12 8C22 9 27 17 24 28Z", fill: "#3fb27f" }),
            h("path", { d: "M24 28C34 26 38 16 36 8C26 9 21 17 24 28Z", fill: "#2e9a6b" }),
            h("path", { d: "M24 30C21 20 23 12 24 5C28 12 28 22 24 30Z", fill: "#5fd09b" }),
            h("path", { d: "M12 30H36L33 43H15Z", fill: "#f4a64a" }),
            h("rect", { x: 10, y: 27, width: 28, height: 6, rx: 2, fill: "#ffbd66" }),
        ]),
    coffee: (s = 44) =>
        art(s, [
            h("rect", { x: 11, y: 6, width: 26, height: 6, rx: 2, fill: "#fff" }),
            h("path", { d: "M13 12H35L32 43H16Z", fill: "#fff" }),
            h("path", { d: "M14 20H34L32.5 33H15.5Z", fill: "#1f9a8f" }),
            h("ellipse", {
                cx: 24, cy: 26.5, rx: 3.2, ry: 5, fill: "#8a5a2b",
                transform: "rotate(25 24 26.5)",
            }),
        ]),
    clock: (s = 44) =>
        art(s, [
            h("path", { d: "M8 13L14 7M40 13L34 7" }),
            h("circle", { cx: 24, cy: 26, r: 15, fill: "#fff" }),
            h("path", { d: "M24 17V26L31 30" }),
        ]),
    star: (s = 44) =>
        art(s, [
            h("polygon", {
                points: "24,5 29.5,17.5 43,19 33,28.5 35.5,42 24,35.5 12.5,42 15,28.5 5,19 18.5,17.5",
                fill: "#ffc94d",
            }),
        ]),
    heart: (s = 44) =>
        art(s, [
            h("path", {
                d: "M24 41C8 29 6 18 12 12C17 8 22 11 24 15C26 11 31 8 36 12C42 18 40 29 24 41Z",
                fill: "#ff7a7a",
            }),
        ]),
    cart: (s = 44) =>
        art(s, [
            h("path", { d: "M5 8H11L16 32H37L41 15H12", fill: "#b4f2dd" }),
            h("circle", { cx: 20, cy: 39, r: 3, fill: INK }),
            h("circle", { cx: 34, cy: 39, r: 3, fill: INK }),
        ]),
    book: (s = 44) =>
        art(s, [
            h("path", {
                d: "M24 12C19 8 11 8 6 10V38C11 36 19 36 24 40C29 36 37 36 42 38V10C37 8 29 8 24 12Z",
                fill: "#9fd8ff",
            }),
            h("path", { d: "M24 12V40" }),
        ]),
    briefcase: (s = 44) =>
        art(s, [
            h("path", { d: "M17 15V11H31V15" }),
            h("rect", { x: 6, y: 15, width: 36, height: 24, rx: 4, fill: "#c9a27a" }),
            h("path", { d: "M6 26H42" }),
            h("rect", { x: 21, y: 24, width: 6, height: 5, rx: 1, fill: "#ffd58a" }),
        ]),
};

/** Icon names, in display order. @type {string[]} */
export const ICON_NAMES = Object.keys(ICONS);

/**
 * @param {string} d - Path data.
 * @param {number} [size=22]
 * @returns {import("../src/index.js").VElement} A `currentColor` UI icon.
 */
function ui(d, size = 22) {
    return h(
        "svg",
        {
            viewBox: "0 0 24 24",
            width: size,
            height: size,
            fill: "none",
            stroke: "currentColor",
            "stroke-width": 3,
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            "aria-hidden": "true",
        },
        [h("path", { d })]
    );
}

/** "+" icon. @returns {import("../src/index.js").VElement} */
export const PlusIcon = () => ui("M12 5V19M5 12H19");
/** Check mark. @param {number} [s] @returns {import("../src/index.js").VElement} */
export const CheckIcon = (s) => ui("M5 12.5L9.5 17L19 7", s);
/** "x" icon. @param {number} [s] @returns {import("../src/index.js").VElement} */
export const CloseIcon = (s) => ui("M6 6L18 18M18 6L6 18", s);
