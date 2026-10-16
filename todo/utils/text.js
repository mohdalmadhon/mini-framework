export function clean(text, max) {
    return typeof text === "string" ? text.trim().slice(0, max).trim() : "";
}

export const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;
