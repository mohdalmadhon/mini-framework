const HEX = /^#[0-9a-f]{6}$/i;

export const isHexColor = (value) => typeof value === "string" && HEX.test(value);

export function inkFor(hex) {
    const n = parseInt(hex.slice(1), 16);
    const luma = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
    return luma > 150 ? "#1f3a3d" : "#ffffff";
}
