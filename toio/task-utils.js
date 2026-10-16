export function textColorFor(hex) {
    const n = parseInt(hex.slice(1), 16);
    const luma = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
    return luma > 150 ? "#1f3a3d" : "#ffffff";
}

export const preview = (text, max) => {
    const flat = text.replace(/\s+/g, " ").trim();
    return flat.length > max ? `${flat.slice(0, max).trimEnd()}...` : flat;
};

export const isCut = (task) => task.title.length > 32 || task.description.length > 80 || task.description.includes("\n");

export const stamp = (ts) => {
    const d = new Date(ts);
    const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    return `${time} ${d.toLocaleDateString("en-US", { weekday: "short" })} (${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;
};
