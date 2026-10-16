import { createElemant as h, ref, on } from "../src/index.js";

const INK = "#1f3a3d";
const STORAGE_KEY = "toio-pets";

const DEFAULTS = [
    { id: "blob", fx: 0.02, fy: 0.86 },
    { id: "cat", fx: 0.98, fy: 0.55 },
    { id: "bunny", fx: 0.9, fy: 0.9 },
    { id: "ghost", fx: 0.02, fy: 0.5 },
    { id: "cloud", fx: 0.45, fy: 0.94 },
    { id: "bear", fx: 0.02, fy: 0.68 },
    { id: "star", fx: 0.72, fy: 0.94 },
];

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

function loadPets() {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (!Array.isArray(data)) return DEFAULTS;
        const saved = data.filter(
            (p) => p && DEFAULTS.some((d) => d.id === p.id) && Number.isFinite(p.fx) && Number.isFinite(p.fy)
        );
        const missing = DEFAULTS.filter((d) => !saved.some((p) => p.id === d.id));
        return [...saved.map((p) => ({ id: p.id, fx: clamp(p.fx, 0, 1), fy: clamp(p.fy, 0, 1) })), ...missing];
    } catch {
        return DEFAULTS;
    }
}

function savePets(list) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
        return;
    }
}

const pets = ref("toio:pets", loadPets());
const held = ref("toio:held", null);
const viewport = ref("toio:viewport", { w: window.innerWidth, h: window.innerHeight });

let tiltTimer = 0;

on("resize", () => {
    viewport.value = { w: window.innerWidth, h: window.innerHeight };
});

const petSize = (w) => Math.round(clamp(w * 0.09, 58, 88));

function star(cx, cy, outer, inner) {
    const points = [];
    for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        points.push(`${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`);
    }
    return `M${points.join("L")}Z`;
}

function face(x, y, isHeld, spread = 7) {
    const eyes = isHeld
        ? [
              h("path", { d: `M${x - spread - 3.5} ${y + 1}Q${x - spread} ${y - 5} ${x - spread + 3.5} ${y + 1}`, fill: "none" }),
              h("path", { d: `M${x + spread - 3.5} ${y + 1}Q${x + spread} ${y - 5} ${x + spread + 3.5} ${y + 1}`, fill: "none" }),
          ]
        : [
              h("circle", { cx: x - spread, cy: y, r: 2.6, fill: INK, stroke: "none" }),
              h("circle", { cx: x + spread, cy: y, r: 2.6, fill: INK, stroke: "none" }),
              h("circle", { cx: x - spread + 0.9, cy: y - 0.9, r: 0.9, fill: "#fff", stroke: "none" }),
              h("circle", { cx: x + spread + 0.9, cy: y - 0.9, r: 0.9, fill: "#fff", stroke: "none" }),
          ];

    const mouth = isHeld
        ? h("path", { d: `M${x - 4} ${y + 5}Q${x} ${y + 13} ${x + 4} ${y + 5}Z`, fill: "#ff7a8a" })
        : h("path", { d: `M${x - 3.5} ${y + 5}Q${x} ${y + 8.5} ${x + 3.5} ${y + 5}`, fill: "none" });

    return h("g", {}, [
        h("ellipse", { cx: x - spread - 4.5, cy: y + 5.5, rx: 3.4, ry: 2.2, fill: "#ff9fb5", opacity: 0.75, stroke: "none" }),
        h("ellipse", { cx: x + spread + 4.5, cy: y + 5.5, rx: 3.4, ry: 2.2, fill: "#ff9fb5", opacity: 0.75, stroke: "none" }),
        ...eyes,
        mouth,
    ]);
}

const BODIES = {
    blob: (isHeld) => [
        h("path", { d: "M32 9C47 9 57 21 57 36C57 50 47 57 32 57C17 57 7 50 7 36C7 21 17 9 32 9Z", fill: "#b4f2dd" }),
        h("path", { d: "M32 9C30 4 34 2 37 3", fill: "none" }),
        face(32, 34, isHeld),
    ],
    cat: (isHeld) => [
        h("path", {
            d: "M9 31L10 8L25 17Q32 15.5 39 17L54 8L55 31C55 47 46 57 32 57C18 57 9 47 9 31Z",
            fill: "#ffd58a",
        }),
        h("path", { d: "M14 14L21 18L14 24Z M50 14L43 18L50 24Z", fill: "#ffb4a8" }),
        h("path", { d: "M3 36L11 37M3 43L11 41M61 36L53 37M61 43L53 41", fill: "none" }),
        face(32, 36, isHeld),
    ],
    bunny: (isHeld) => [
        h("ellipse", { cx: 22, cy: 17, rx: 6, ry: 15, fill: "#f7a8d8" }),
        h("ellipse", { cx: 42, cy: 17, rx: 6, ry: 15, fill: "#f7a8d8" }),
        h("ellipse", { cx: 22, cy: 18, rx: 2.5, ry: 9, fill: "#ffe0f1", stroke: "none" }),
        h("ellipse", { cx: 42, cy: 18, rx: 2.5, ry: 9, fill: "#ffe0f1", stroke: "none" }),
        h("circle", { cx: 32, cy: 40, r: 18, fill: "#f7a8d8" }),
        face(32, 39, isHeld),
    ],
    ghost: (isHeld) => [
        h("path", {
            d: "M11 56V30C11 18 20 8 32 8C44 8 53 18 53 30V56L46.5 50L39.5 56L32 50L24.5 56L17.5 50Z",
            fill: "#f1fffa",
        }),
        face(32, 30, isHeld),
    ],
    cloud: (isHeld) => [
        h("path", {
            d: "M17 50C8 50 4 43 6 37C7.5 32 12 30 16 31C16 22 24 16 32 19C38 13 50 17 49 27C57 27 60 35 57 41C55 47 50 50 45 50Z",
            fill: "#9fd8ff",
        }),
        face(31, 36, isHeld),
    ],
    bear: (isHeld) => [
        h("circle", { cx: 14, cy: 16, r: 9, fill: "#c9c4ff" }),
        h("circle", { cx: 50, cy: 16, r: 9, fill: "#c9c4ff" }),
        h("circle", { cx: 14, cy: 16, r: 4, fill: "#e6e3ff", stroke: "none" }),
        h("circle", { cx: 50, cy: 16, r: 4, fill: "#e6e3ff", stroke: "none" }),
        h("circle", { cx: 32, cy: 36, r: 23, fill: "#c9c4ff" }),
        h("ellipse", { cx: 32, cy: 44, rx: 8, ry: 6, fill: "#e6e3ff", stroke: "none" }),
        face(32, 34, isHeld, 9),
    ],
    star: (isHeld) => [
        h("path", { d: star(32, 34, 29, 15), fill: "#ffc94d" }),
        face(32, 35, isHeld, 5.5),
    ],
};

function pointerDown(e, id) {
    e.preventDefault();
    const box = e.currentTarget.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);
    held.value = { id, tilt: 0, offX: e.clientX - box.left, offY: e.clientY - box.top, lastX: e.clientX };
    const item = pets.value.find((p) => p.id === id);
    if (item) pets.value = [...pets.value.filter((p) => p.id !== id), item];
}

function pointerMove(e, id) {
    const state = held.value;
    if (!state || state.id !== id) return;

    const w = window.innerWidth;
    const hgt = window.innerHeight;
    const size = petSize(w);
    const x = clamp(e.clientX - state.offX, 0, w - size);
    const y = clamp(e.clientY - state.offY, 0, hgt - size);

    pets.value = pets.value.map((p) =>
        p.id === id ? { id, fx: w > size ? x / (w - size) : 0, fy: hgt > size ? y / (hgt - size) : 0 } : p
    );

    held.value = { ...state, tilt: clamp((e.clientX - state.lastX) * 2.2, -22, 22), lastX: e.clientX };

    clearTimeout(tiltTimer);
    tiltTimer = setTimeout(() => {
        if (held.value) held.value = { ...held.value, tilt: 0 };
    }, 90);
}

function pointerUp(e, id) {
    if (!held.value || held.value.id !== id) return;
    clearTimeout(tiltTimer);
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    held.value = null;
    savePets(pets.value);
}

export function Pets() {
    const { w, h: vh } = viewport.value;
    const size = petSize(w);
    const current = held.value;

    return h(
        "div",
        { key: "pets", class: "pets", "aria-hidden": "true" },
        pets.value.map((p, i) => {
            const isHeld = current?.id === p.id;
            const x = p.fx * Math.max(0, w - size);
            const y = p.fy * Math.max(0, vh - size);
            const tilt = isHeld ? current.tilt : 0;
            const scale = isHeld ? 1.18 : 1;

            return h(
                "div",
                {
                    key: p.id,
                    class: isHeld ? "pet held" : "pet",
                    style: {
                        width: `${size}px`,
                        height: `${size}px`,
                        zIndex: String(i + 1),
                        transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${tilt}deg) scale(${scale})`,
                    },
                    onPointerDown: (e) => pointerDown(e, p.id),
                    onPointerMove: (e) => pointerMove(e, p.id),
                    onPointerUp: (e) => pointerUp(e, p.id),
                    onPointerCancel: (e) => pointerUp(e, p.id),
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
                        BODIES[p.id](isHeld)
                    ),
                ]
            );
        })
    );
}
