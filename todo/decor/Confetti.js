import { createElemant as h, ref } from "../../src/index.js";

const COLORS = ["#ffd58a", "#b4f2dd", "#ffb4a8", "#c9c4ff", "#9fd8ff", "#f7a8d8", "#ffffff"];
const DURATION_MS = 3200;

const confetti = ref("confetti", null);
let timer = 0;

function makePieces(count) {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.round(Math.random() * 100),
        delay: Math.round(Math.random() * 600) / 1000,
        duration: 1.8 + Math.round(Math.random() * 12) / 10,
        drift: Math.round(Math.random() * 120 - 60),
        spin: Math.round(Math.random() * 720 - 360),
        color: COLORS[i % COLORS.length],
        round: i % 3 === 0,
    }));
}

export function celebrate() {
    clearTimeout(timer);
    confetti.value = { id: Date.now(), pieces: makePieces(40) };
    timer = setTimeout(() => (confetti.value = null), DURATION_MS);
}

export function Confetti() {
    const c = confetti.value;
    if (!c) return null;

    return h(
        "div",
        { key: `confetti-${c.id}`, class: "confetti", "aria-hidden": "true" },
        c.pieces.map((p) =>
            h("span", {
                key: p.id,
                class: p.round ? "piece round" : "piece",
                style: {
                    left: `${p.left}%`,
                    backgroundColor: p.color,
                    animationDelay: `${p.delay}s`,
                    animationDuration: `${p.duration}s`,
                    "--drift": `${p.drift}px`,
                    "--spin": `${p.spin}deg`,
                },
            })
        )
    );
}
