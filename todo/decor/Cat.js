import { createElemant as h, ref, on } from "../../src/index.js";
import { mood, react } from "../state/mood.js";

const INK = "#1f3a3d";
const STORAGE_KEY = "todo-cat";
const START = { fx: 0.98, fy: 0.55 };
const CLICK_DISTANCE = 5;

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

function loadSpot() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (!Number.isFinite(saved?.fx) || !Number.isFinite(saved?.fy)) return START;
        return { fx: clamp(saved.fx, 0, 1), fy: clamp(saved.fy, 0, 1) };
    } catch {
        return START;
    }
}

function saveSpot(spot) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(spot));
    } catch {
        return;
    }
}

const spot = ref("cat:spot", loadSpot());
const held = ref("cat:held", null);
const viewport = ref("cat:viewport", { w: window.innerWidth, h: window.innerHeight });
const gaze = ref("cat:gaze", { x: 0, y: 0 });

let tiltTimer = 0;

const catSize = (w) => Math.round(clamp(w * 0.09, 58, 88));

function catBox() {
    const { w, h: vh } = viewport.value;
    const size = catSize(w);
    return {
        size,
        x: spot.value.fx * Math.max(0, w - size),
        y: spot.value.fy * Math.max(0, vh - size),
    };
}

on("resize", () => {
    viewport.value = { w: window.innerWidth, h: window.innerHeight };
});

on("pointermove", (e) => {
    const { size, x, y } = catBox();
    const dx = e.clientX - (x + size / 2);
    const dy = e.clientY - (y + size / 2);
    const next = { x: Math.round(clamp(dx / 160, -1, 1) * 2), y: Math.round(clamp(dy / 160, -1, 1) * 2) };
    if (next.x !== gaze.value.x || next.y !== gaze.value.y) gaze.value = next;
});

const dot = (cx, cy, r, fill) => h("circle", { cx, cy, r, fill, stroke: "none" });

function eyes(face) {
    const { x: gx, y: gy } = gaze.value;

    if (face === "happy") {
        return [h("path", { d: "M21.5 37Q25 31 28.5 37M35.5 37Q39 31 42.5 37", fill: "none" })];
    }
    if (face === "sleep") {
        return [h("path", { d: "M21.5 35Q25 39 28.5 35M35.5 35Q39 39 42.5 35", fill: "none" })];
    }
    if (face === "sad") {
        return [
            dot(25, 37, 2.6, INK),
            dot(39, 37, 2.6, INK),
            h("path", { d: "M20.5 31.5L28 33.5M43.5 31.5L36 33.5", fill: "none" }),
            h("path", { d: "M44 40Q45.5 43 44 44.5Q42.5 43 44 40Z", fill: "#9fd8ff", "stroke-width": 1.2 }),
        ];
    }
    if (face === "wow") {
        return [
            h("circle", { cx: 25, cy: 35, r: 4.4, fill: "#fff" }),
            h("circle", { cx: 39, cy: 35, r: 4.4, fill: "#fff" }),
            dot(25, 35, 2.4, INK),
            dot(39, 35, 2.4, INK),
        ];
    }
    return [
        dot(25 + gx, 36 + gy, 2.6, INK),
        dot(39 + gx, 36 + gy, 2.6, INK),
        dot(25.9 + gx, 35.1 + gy, 0.9, "#fff"),
        dot(39.9 + gx, 35.1 + gy, 0.9, "#fff"),
    ];
}

function mouth(face) {
    if (face === "happy") return h("path", { d: "M28 41Q32 49 36 41Z", fill: "#ff7a8a" });
    if (face === "wow") return h("ellipse", { cx: 32, cy: 45, rx: 3, ry: 3.6, fill: "#ff7a8a" });
    if (face === "sad") return h("path", { d: "M28.5 45Q32 41.5 35.5 45", fill: "none" });
    if (face === "sleep") return h("path", { d: "M30 43.5H34", fill: "none" });
    return h("path", { d: "M28.5 41Q32 44.5 35.5 41", fill: "none" });
}

function catShapes(face) {
    return [
        h("path", {
            d: "M9 31L10 8L25 17Q32 15.5 39 17L54 8L55 31C55 47 46 57 32 57C18 57 9 47 9 31Z",
            fill: "#ffd58a",
        }),
        h("path", { d: "M14 14L21 18L14 24Z M50 14L43 18L50 24Z", fill: "#ffb4a8" }),
        h("path", { d: "M3 36L11 37M3 43L11 41M61 36L53 37M61 43L53 41", fill: "none" }),
        h("ellipse", { cx: 20.5, cy: 41.5, rx: 3.4, ry: 2.2, fill: "#ff9fb5", opacity: 0.75, stroke: "none" }),
        h("ellipse", { cx: 43.5, cy: 41.5, rx: 3.4, ry: 2.2, fill: "#ff9fb5", opacity: 0.75, stroke: "none" }),
        ...eyes(face),
        mouth(face),
    ];
}

function grab(e) {
    e.preventDefault();
    const box = e.currentTarget.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);
    held.value = {
        tilt: 0,
        offX: e.clientX - box.left,
        offY: e.clientY - box.top,
        lastX: e.clientX,
        startX: e.clientX,
        startY: e.clientY,
    };
}

function drag(e) {
    const state = held.value;
    if (!state) return;

    const { w, h: vh } = viewport.value;
    const size = catSize(w);
    const x = clamp(e.clientX - state.offX, 0, w - size);
    const y = clamp(e.clientY - state.offY, 0, vh - size);

    spot.value = { fx: w > size ? x / (w - size) : 0, fy: vh > size ? y / (vh - size) : 0 };
    held.value = { ...state, tilt: clamp((e.clientX - state.lastX) * 2.2, -22, 22), lastX: e.clientX };

    clearTimeout(tiltTimer);
    tiltTimer = setTimeout(() => {
        if (held.value) held.value = { ...held.value, tilt: 0 };
    }, 90);
}

function drop(e) {
    const state = held.value;
    if (!state) return;
    clearTimeout(tiltTimer);
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    held.value = null;
    saveSpot(spot.value);

    const moved = Math.hypot(e.clientX - state.startX, e.clientY - state.startY);
    if (moved < CLICK_DISTANCE) react("pet");
}

function Bubble(text, id, box) {
    const { w } = viewport.value;
    const onRight = box.x + box.size / 2 > w / 2;
    const below = box.y < 90;

    return h(
        "div",
        {
            key: `bubble-${id}`,
            class: below ? "cat-bubble below" : "cat-bubble",
            role: "status",
            style: {
                top: below ? `${box.y + box.size + 10}px` : `${box.y - 10}px`,
                left: onRight ? null : `${box.x}px`,
                right: onRight ? `${w - box.x - box.size}px` : null,
            },
        },
        [text]
    );
}

export function Cat() {
    const box = catBox();
    const state = held.value;
    const current = mood.value;
    const face = state ? "happy" : current.face;
    const tilt = state ? state.tilt : 0;
    const scale = state ? 1.18 : 1;

    return h("div", { key: "cat", class: "cat-layer" }, [
        h(
            "div",
            {
                key: "cat-body",
                class: `cat ${state ? "held" : `mood-${face}`}`,
                title: "Drag me, or click to pet me",
                style: {
                    width: `${box.size}px`,
                    height: `${box.size}px`,
                    transform: `translate(${box.x.toFixed(1)}px, ${box.y.toFixed(1)}px) rotate(${tilt}deg) scale(${scale})`,
                },
                onPointerDown: grab,
                onPointerMove: drag,
                onPointerUp: drop,
                onPointerCancel: drop,
            },
            [
                h(
                    "svg",
                    {
                        class: "cat-art",
                        viewBox: "0 0 64 64",
                        width: "100%",
                        height: "100%",
                        fill: "none",
                        stroke: INK,
                        "stroke-width": 2.4,
                        "stroke-linejoin": "round",
                        "stroke-linecap": "round",
                        "aria-hidden": "true",
                    },
                    catShapes(face)
                ),
                face === "sleep" ? h("span", { class: "cat-zzz", "aria-hidden": "true" }, ["z", h("span", {}, ["z"]), h("span", {}, ["z"])]) : null,
            ]
        ),
        current.text && !state ? Bubble(current.text, current.id, box) : null,
    ]);
}
