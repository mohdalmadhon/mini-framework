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
function ui(d, size = 22, width = 3) {
    return h(
        "svg",
        {
            viewBox: "0 0 24 24",
            width: size,
            height: size,
            fill: "none",
            stroke: "currentColor",
            "stroke-width": width,
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
/** Magnifier. @param {number} [s] @returns {import("../src/index.js").VElement} */
export const SearchIcon = (s) =>
    h(
        "svg",
        {
            viewBox: "0 0 24 24",
            width: s ?? 22,
            height: s ?? 22,
            fill: "none",
            stroke: "currentColor",
            "stroke-width": 3,
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            "aria-hidden": "true",
        },
        [h("circle", { cx: 11, cy: 11, r: 6.5 }), h("path", { d: "M16 16L20.5 20.5" })]
    );

/** Paperclip. @param {number} [s] @returns {import("../src/index.js").VElement} */
export const PaperclipIcon = (s) =>
    ui("M21.4 11L12.2 20.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5", s, 2.5);
/** Document. @param {number} [s] @returns {import("../src/index.js").VElement} */
export const FileIcon = (s) => ui("M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z M13 2v7h7", s, 2.5);
/** Download arrow. @param {number} [s] @returns {import("../src/index.js").VElement} */
export const DownloadIcon = (s) => ui("M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3", s, 2.5);
/** Pencil. @param {number} [s] @returns {import("../src/index.js").VElement} */
export const EditIcon = (s) => ui("M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z", s, 2.5);
/** Undo arrow. @param {number} [s] @returns {import("../src/index.js").VElement} */
export const UndoIcon = (s) => ui("M3 7v6h6 M21 17a9 9 0 0 0-15-6.7L3 13", s, 2.5);
/** House. @param {number} [s] @returns {import("../src/index.js").VElement} */
export const HomeIcon = (s) => ui("M3 11l9-8 9 8 M5 10v10h5v-6h4v6h5V10", s, 2.5);

/**
 * Sad clipboard used on the error page.
 *
 * @param {number} [size=150]
 * @returns {import("../src/index.js").VElement}
 */
export const LostArt = (size = 150) =>
    art(size, [
        h("g", { transform: "rotate(-8 24 26)" }, [
            h("rect", { x: 9, y: 8, width: 30, height: 35, rx: 4, fill: "#f1fffa" }),
            h("rect", { x: 17, y: 4, width: 14, height: 8, rx: 2.5, fill: "#ffd58a" }),
            h("circle", { cx: 18.5, cy: 24, r: 1.6, fill: INK }),
            h("circle", { cx: 29.5, cy: 24, r: 1.6, fill: INK }),
            h("path", { d: "M18 35Q24 28.5 30 35" }),
        ]),
        h("path", { d: "M40 9L44 5M43 14H47M5 10L8 7" }),
    ]);

export const Logo = (size = 40) =>
    h(
        "svg",
        { class: "logo", viewBox: "0 0 64 64", width: size, height: size, "aria-hidden": "true" },
        [
            h("defs", {}, [h("clipPath", { id: "logo-clip" }, [h("rect", { width: 64, height: 64, rx: 16 })])]),
            h("rect", { width: 64, height: 64, rx: 16, fill: "#2b8f89" }),
            h("circle", { cx: 54, cy: 8, r: 14, fill: "#1f6f6b", "clip-path": "url(#logo-clip)" }),
            h("circle", { cx: 21, cy: 25, r: 10, fill: "#f1fffa", stroke: INK, "stroke-width": 3 }),
            h("circle", { cx: 43, cy: 25, r: 10, fill: "#f1fffa", stroke: INK, "stroke-width": 3 }),
            h("circle", { cx: 23, cy: 26, r: 4, fill: INK }),
            h("circle", { cx: 45, cy: 26, r: 4, fill: INK }),
            h("circle", { cx: 24.4, cy: 24.6, r: 1.3, fill: "#fff" }),
            h("circle", { cx: 46.4, cy: 24.6, r: 1.3, fill: "#fff" }),
            h("path", {
                d: "M18 43L28 52L47 37",
                fill: "none",
                stroke: INK,
                "stroke-width": 9,
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
            }),
            h("path", {
                d: "M18 43L28 52L47 37",
                fill: "none",
                stroke: "#ffd58a",
                "stroke-width": 5,
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
            }),
        ]
    );

export const TrophyArt = (size = 120) =>
    art(size, [
        h("path", { d: "M14 8H34V20C34 28 30 33 24 33C18 33 14 28 14 20Z", fill: "#ffd58a" }),
        h("path", { d: "M14 12H8C8 20 11 24 15 24M34 12H40C40 20 37 24 33 24", fill: "none" }),
        h("path", { d: "M24 33V38M17 43H31L29 38H19Z", fill: "#ffbd66" }),
        h("circle", { cx: 20.5, cy: 18, r: 1.4, fill: INK, stroke: "none" }),
        h("circle", { cx: 27.5, cy: 18, r: 1.4, fill: INK, stroke: "none" }),
        h("path", { d: "M21 22Q24 25 27 22", fill: "none" }),
        h("path", { d: "M5 5L8 8M43 5L40 8M24 2V4" }),
    ]);
