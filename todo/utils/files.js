import { LIMITS } from "../config/constants.js";

export function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export const isImage = (file) => typeof file.type === "string" && file.type.startsWith("image/");

const bytesOf = (dataUrl) => Math.round(((dataUrl.length - dataUrl.indexOf(",") - 1) * 3) / 4);

function readAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error(`Could not read "${file.name}".`));
        reader.readAsDataURL(file);
    });
}

function loadImage(url, name) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`"${name}" is not a valid image.`));
        img.src = url;
    });
}

async function shrinkImage(file) {
    const url = URL.createObjectURL(file);
    try {
        const img = await loadImage(url, file.name);
        const scale = Math.min(1, LIMITS.imageSide / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/jpeg", 0.8);
    } finally {
        URL.revokeObjectURL(url);
    }
}

export async function prepareFile(file) {
    const name = (file.name || "file").slice(0, LIMITS.fileName);
    const shrinkable = file.type.startsWith("image/") && file.type !== "image/gif" && file.type !== "image/svg+xml";
    const tooBig = `"${name}" is too big (max ${formatSize(LIMITS.fileBytes)}).`;

    if (!shrinkable && file.size > LIMITS.fileBytes) throw new Error(tooBig);

    const data = shrinkable ? await shrinkImage(file) : await readAsDataURL(file);
    const size = bytesOf(data);
    if (size > LIMITS.fileBytes) throw new Error(tooBig);

    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        type: shrinkable ? "image/jpeg" : file.type || "application/octet-stream",
        size,
        data,
    };
}

export function downloadFile(file) {
    const link = document.createElement("a");
    link.href = file.data;
    link.download = file.name;
    link.click();
}
