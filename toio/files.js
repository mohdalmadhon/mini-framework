
export const MAX_FILES = 6;
export const MAX_FILE_BYTES = 1.5 * 1024 * 1024;
export const MAX_IMAGE_SIDE = 1280;
export const STORAGE_LIMIT = 4_400_000;
export const ACCEPT = "image/*,.pdf,.doc,.docx,.txt,.md,.csv,.json,.xls,.xlsx,.ppt,.pptx,.zip";

export function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export const isImage = (a) => typeof a.type === "string" && a.type.startsWith("image/");

function readAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error(`Could not read "${file.name}".`));
        reader.readAsDataURL(file);
    });
}

async function shrinkImage(file) {
    const url = URL.createObjectURL(file);
    try {
        const img = await new Promise((resolve, reject) => {
            const el = new Image();
            el.onload = () => resolve(el);
            el.onerror = () => reject(new Error(`"${file.name}" is not a valid image.`));
            el.src = url;
        });

        const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
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
    const name = (file.name || "file").slice(0, 80);
    const keepAsIs = file.type === "image/gif" || file.type === "image/svg+xml";
    let type = file.type || "application/octet-stream";
    let data;

    if (type.startsWith("image/") && !keepAsIs) {
        data = await shrinkImage(file);
        type = "image/jpeg";
    } else {
        if (file.size > MAX_FILE_BYTES) {
            throw new Error(`"${name}" is too big (max ${formatSize(MAX_FILE_BYTES)}).`);
        }
        data = await readAsDataURL(file);
    }

    const base64 = data.length - data.indexOf(",") - 1;
    return {
        id: Date.now() + Math.floor(Math.random() * 1_000_000),
        name,
        type,
        size: Math.round((base64 * 3) / 4),
        data,
    };
}

export function downloadAttachment(att) {
    const bin = atob(att.data.slice(att.data.indexOf(",") + 1));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

    const url = URL.createObjectURL(new Blob([bytes], { type: att.type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = att.name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
