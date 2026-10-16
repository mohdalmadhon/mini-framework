import { createElemant as h, ref, on } from "../src/index.js";
import { TrophyArt, CheckIcon } from "./icons.js";

const COLORS = ["#ffd58a", "#b4f2dd", "#ffb4a8", "#c9c4ff", "#9fd8ff", "#f7a8d8", "#ffffff"];

const MESSAGES = {
    done: { title: "All done!", text: "You finished every single task. Time to celebrate!", button: "Yay!" },
    clear: { title: "Squeaky clean!", text: "Your list is empty. A fresh start awaits.", button: "Awesome" },
};

export const celebration = ref("toio:celebration", null);

function makePieces(count) {
    const pieces = [];
    for (let i = 0; i < count; i++) {
        pieces.push({
            id: i,
            left: Math.round(Math.random() * 100),
            delay: Math.round(Math.random() * 900) / 1000,
            duration: 2.2 + Math.round(Math.random() * 20) / 10,
            drift: Math.round(Math.random() * 120 - 60),
            spin: Math.round(Math.random() * 720 - 360),
            color: COLORS[i % COLORS.length],
            round: i % 3 === 0,
        });
    }
    return pieces;
}

export function celebrate(kind) {
    celebration.value = { kind, pieces: makePieces(46), id: Date.now() };
}

export function closeCelebration() {
    celebration.value = null;
}

on("keydown", (e) => {
    if (e.key === "Escape" && celebration.value) closeCelebration();
});

export function Celebration() {
    const c = celebration.value;
    if (!c) return null;
    const msg = MESSAGES[c.kind] ?? MESSAGES.done;

    return h(
        "div",
        {
            key: `celebration-${c.id}`,
            class: "overlay celebrate",
            onClick: (ev) => {
                if (ev.target === ev.currentTarget) closeCelebration();
            },
        },
        [
            h(
                "div",
                { class: "confetti", "aria-hidden": "true" },
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
            ),
            h(
                "div",
                { class: "celebrate-card", role: "dialog", "aria-modal": "true", "aria-label": msg.title },
                [
                    h("div", { class: "celebrate-art" }, [TrophyArt(130)]),
                    h("h2", { class: "celebrate-title" }, [msg.title]),
                    h("p", { class: "celebrate-text" }, [msg.text]),
                    h("button", { type: "button", class: "btn primary", onClick: closeCelebration }, [msg.button, CheckIcon(18)]),
                ]
            ),
        ]
    );
}
