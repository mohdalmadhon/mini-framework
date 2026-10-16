import { createElemant as h, ref, on } from "../../src/index.js";

const INK = "#1f3a3d";
const STORAGE_KEY = "todo-cat";
const START = { fx: 0.98, fy: 0.55 };

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

let tiltTimer = 0;

on("resize", () => {
    viewport.value = { w: window.innerWidth, h: window.innerHeight };
});

const catSize = (w) => Math.round(clamp(w * 0.09, 58, 88));

function face(isHeld) {
    const eyes = isHeld
        ? [
              h("path", { d: "M21.5 37Q25 31 28.5 37", fill: "none" }),
              h("path", { d: "M35.5 37Q39 31 42.5 37", fill: "none" }),
          ]
        : [
              h("circle", { cx: 25, cy: 36, r: 2.6, fill: INK, stroke: "none" }),
              h("circle", { cx: 39, cy: 36, r: 2.6, fill: INK, stroke: "none" }),
              h("circle", { cx: 25.9, cy: 35.1, r: 0.9, fill: "#fff", stroke: "none" }),
              h("circle", { cx: 39.9, cy: 35.1, r: 0.9, fill: "#fff", stroke: "none" }),
          ];

    return [
        h("ellipse", { cx: 20.5, cy: 41.5, rx: 3.4, ry: 2.2, fill: "#ff9fb5", opacity: 0.75, stroke: "none" }),
        h("ellipse", { cx: 43.5, cy: 41.5, rx: 3.4, ry: 2.2, fill: "#ff9fb5", opacity: 0.75, stroke: "none" }),
        ...eyes,
        isHeld
            ? h("path", { d: "M28 41Q32 49 36 41Z", fill: "#ff7a8a" })
            : h("path", { d: "M28.5 41Q32 44.5 35.5 41", fill: "none" }),
    ];
}

function catShapes(isHeld) {
    return [
        h("path", {
            d: "M9 31L10 8L25 17Q32 15.5 39 17L54 8L55 31C55 47 46 57 32 57C18 57 9 47 9 31Z",
            fill: "#ffd58a",
        }),
        h("path", { d: "M14 14L21 18L14 24Z M50 14L43 18L50 24Z", fill: "#ffb4a8" }),
        h("path", { d: "M3 36L11 37M3 43L11 41M61 36L53 37M61 43L53 41", fill: "none" }),
        ...face(isHeld),
    ];
}

function grab(e) {
    e.preventDefault();
    const box = e.currentTarget.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);
    held.value = { tilt: 0, offX: e.clientX - box.left, offY: e.clientY - box.top, lastX: e.clientX };
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
    if (!held.value) return;
    clearTimeout(tiltTimer);
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    held.value = null;
    saveSpot(spot.value);
}

export function Cat() {
    const { w, h: vh } = viewport.value;
    const size = catSize(w);
    const state = held.value;
    const x = spot.value.fx * Math.max(0, w - size);
    const y = spot.value.fy * Math.max(0, vh - size);
    const tilt = state ? state.tilt : 0;
    const scale = state ? 1.18 : 1;

    return h("div", { key: "cat", class: "cat-layer", "aria-hidden": "true" }, [
        h(
            "div",
            {
                class: state ? "cat held" : "cat",
                style: {
                    width: `${size}px`,
                    height: `${size}px`,
                    transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${tilt}deg) scale(${scale})`,
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
                        viewBox: "0 0 64 64",
                        width: "100%",
                        height: "100%",
                        fill: "none",
                        stroke: INK,
                        "stroke-width": 2.4,
                        "stroke-linejoin": "round",
                        "stroke-linecap": "round",
                    },
                    catShapes(Boolean(state))
                ),
            ]
        ),
    ]);
}
