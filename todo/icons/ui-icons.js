import { createElemant as h } from "../../src/index.js";

const INK = "#1f3a3d";

function line(d, size = 20, width = 2.5) {
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

export const CloseIcon = (s) => line("M6 6L18 18M18 6L6 18", s);
export const UndoIcon = (s) => line("M3 7v6h6 M21 17a9 9 0 0 0-15-6.7L3 13", s);
export const HomeIcon = (s) => line("M3 11l9-8 9 8 M5 10v10h5v-6h4v6h5V10", s);
export const ChevronIcon = (s) => line("M6 9l6 6 6-6", s);
export const MoreIcon = (s) => line("M5 12h.01M12 12h.01M19 12h.01", s, 4);
export const PaperclipIcon = (s) =>
    line("M21.4 11L12.2 20.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5", s);
export const FileIcon = (s) => line("M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z M13 2v7h7", s);
export const DownloadIcon = (s) => line("M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3", s);
export const NoneIcon = (s) => line("M5 5L19 19 M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18", s);

export const LostArt = (size = 150) =>
    h(
        "svg",
        {
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
        [
            h("g", { transform: "rotate(-8 24 26)" }, [
                h("rect", { x: 9, y: 8, width: 30, height: 35, rx: 4, fill: "#f1fffa" }),
                h("rect", { x: 17, y: 4, width: 14, height: 8, rx: 2.5, fill: "#ffd58a" }),
                h("path", { d: "M15 20H33M15 27H33M15 34H26" }),
            ]),
            h("path", { d: "M40 9L44 5M43 14H47M5 10L8 7" }),
        ]
    );
