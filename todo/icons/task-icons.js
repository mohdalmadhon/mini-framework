import { createElemant as h } from "../../src/index.js";

const INK = "#1f3a3d";

const TASK_ICONS = {
    star: {
        label: "Star",
        draw: () => [
            h("polygon", {
                points: "12,2.5 14.8,8.6 21.4,9.3 16.4,13.8 17.8,20.3 12,17 6.2,20.3 7.6,13.8 2.6,9.3 9.2,8.6",
                fill: "#ffc94d",
            }),
        ],
    },
    heart: {
        label: "Heart",
        draw: () => [
            h("path", {
                d: "M12 20.5C5 15.5 3 11.5 4.2 8.2C5.4 5 9.5 4.3 12 7.6C14.5 4.3 18.6 5 19.8 8.2C21 11.5 19 15.5 12 20.5Z",
                fill: "#ff7a7a",
            }),
        ],
    },
    home: {
        label: "Home",
        draw: () => [
            h("path", { d: "M6 10V20H18V10", fill: "#ffd58a" }),
            h("rect", { x: 10, y: 14, width: 4, height: 6, fill: "#2b8f89" }),
            h("path", { d: "M3.5 11.5L12 4L20.5 11.5" }),
        ],
    },
    work: {
        label: "Work",
        draw: () => [
            h("path", { d: "M9 7.5V5.5A1.5 1.5 0 0 1 10.5 4H13.5A1.5 1.5 0 0 1 15 5.5V7.5" }),
            h("rect", { x: 3, y: 7.5, width: 18, height: 12, rx: 2, fill: "#d9a06b" }),
            h("path", { d: "M3 12.5H21M10.5 12.5V14.5H13.5V12.5" }),
        ],
    },
    shopping: {
        label: "Shopping",
        draw: () => [
            h("path", { d: "M2.5 4H5.5L7.7 14.5H18.3L20.5 7H6.6", fill: "#b4f2dd" }),
            h("circle", { cx: 9.5, cy: 19, r: 1.6, fill: INK }),
            h("circle", { cx: 17, cy: 19, r: 1.6, fill: INK }),
        ],
    },
    study: {
        label: "Study",
        draw: () => [
            h("path", {
                d: "M12 6.5C9.5 4.8 6 4.5 3 5.5V18.5C6 17.5 9.5 17.8 12 19.5C14.5 17.8 18 17.5 21 18.5V5.5C18 4.5 14.5 4.8 12 6.5Z",
                fill: "#9fd8ff",
            }),
            h("path", { d: "M12 6.5V19.5" }),
        ],
    },
    fitness: {
        label: "Fitness",
        draw: () => [
            h("path", { d: "M8.5 12H15.5" }),
            h("rect", { x: 2.5, y: 8.5, width: 3, height: 7, rx: 1, fill: "#c9c4ff" }),
            h("rect", { x: 5.5, y: 6.5, width: 3, height: 11, rx: 1, fill: "#c9c4ff" }),
            h("rect", { x: 15.5, y: 6.5, width: 3, height: 11, rx: 1, fill: "#c9c4ff" }),
            h("rect", { x: 18.5, y: 8.5, width: 3, height: 7, rx: 1, fill: "#c9c4ff" }),
        ],
    },
    travel: {
        label: "Travel",
        draw: () => [
            h("path", { d: "M21 3.5L2.5 11L9.5 13.5L12 20.5L21 3.5Z", fill: "#9fd8ff" }),
            h("path", { d: "M9.5 13.5L21 3.5" }),
        ],
    },
    code: {
        label: "Code",
        draw: () => [
            h("rect", { x: 2.5, y: 4, width: 19, height: 13.5, rx: 2, fill: "#2f3037" }),
            h("path", { d: "M9.5 8.5L6.5 10.8L9.5 13M14.5 8.5L17.5 10.8L14.5 13", stroke: "#b4f2dd" }),
            h("path", { d: "M8 21H16M12 17.5V21" }),
        ],
    },
    music: {
        label: "Music",
        draw: () => [
            h("path", { d: "M9 17.5V5.5L20 3.5V15.5M9 9.5L20 7.5" }),
            h("circle", { cx: 6.5, cy: 17.5, r: 2.7, fill: "#f7a8d8" }),
            h("circle", { cx: 17.5, cy: 15.5, r: 2.7, fill: "#f7a8d8" }),
        ],
    },
    gift: {
        label: "Gift",
        draw: () => [
            h("rect", { x: 3.5, y: 10, width: 17, height: 10.5, rx: 1.5, fill: "#ffb4a8" }),
            h("rect", { x: 2.5, y: 7, width: 19, height: 4, rx: 1, fill: "#ffd58a" }),
            h("path", { d: "M12 7V20.5" }),
            h("path", {
                d: "M12 7C10 3.5 6.5 4 7.5 6.2C8.2 7.4 12 7 12 7ZM12 7C14 3.5 17.5 4 16.5 6.2C15.8 7.4 12 7 12 7Z",
                fill: "#ff7a7a",
            }),
        ],
    },
    plant: {
        label: "Plant",
        draw: () => [
            h("path", { d: "M5 19C4 11 9 4.5 20 4C20.5 15 14 20 5 19Z", fill: "#5fd09b" }),
            h("path", { d: "M5 19C9 14 12 11.5 16 8.5" }),
        ],
    },
    coffee: {
        label: "Coffee",
        draw: () => [
            h("path", { d: "M8.5 3.5C7.5 4.7 9.5 5.5 8.5 6.8M12.5 3.5C11.5 4.7 13.5 5.5 12.5 6.8" }),
            h("path", { d: "M16.5 10.5H18A2.5 2.5 0 0 1 18 15.5H16.4" }),
            h("path", { d: "M4.5 9H16.5V15A5 5 0 0 1 11.5 20H9.5A5 5 0 0 1 4.5 15Z", fill: "#ffffff" }),
            h("path", { d: "M5 12H16", stroke: "#8a5a2b" }),
        ],
    },
    reminder: {
        label: "Reminder",
        draw: () => [
            h("path", { d: "M12 3.5V5" }),
            h("path", { d: "M6 16.5V11A6 6 0 0 1 18 11V16.5L19.5 18.5H4.5Z", fill: "#ffd58a" }),
            h("path", { d: "M10 20.5A2 2 0 0 0 14 20.5" }),
        ],
    },
};

export const TASK_ICON_NAMES = Object.keys(TASK_ICONS);

export const isTaskIcon = (name) => typeof name === "string" && Object.hasOwn(TASK_ICONS, name);

export const taskIconLabel = (name) => TASK_ICONS[name]?.label ?? name;

export function taskIcon(name, size = 28) {
    if (!isTaskIcon(name)) return null;
    return h(
        "svg",
        {
            class: "task-icon-svg",
            viewBox: "0 0 24 24",
            width: size,
            height: size,
            fill: "none",
            stroke: INK,
            "stroke-width": 1.6,
            "stroke-linejoin": "round",
            "stroke-linecap": "round",
            "aria-hidden": "true",
        },
        TASK_ICONS[name].draw()
    );
}
