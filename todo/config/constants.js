export const STORAGE_KEY = "todos-mini-framework";

export const ENTER_KEY = "Enter";
export const ESCAPE_KEY = "Escape";

export const LIMITS = Object.freeze({

    title: 60,

    description: 200,

    files: 5,

    fileBytes: 1024 * 1024,

    imageSide: 1280,

    fileName: 80,

    storage: 4_500_000,
});

export const ACCEPT = "image/*,.pdf,.doc,.docx,.txt,.md,.csv,.json,.xls,.xlsx,.ppt,.pptx,.zip";

export const SWATCHES = ["#b4f2dd", "#ffd58a", "#ffb4a8", "#c9c4ff", "#9fd8ff", "#f7a8d8"];

export const FILTERS = [
    { label: "All", path: "/", href: "#/" },
    { label: "Active", path: "/active", href: "#/active" },
    { label: "Completed", path: "/completed", href: "#/completed" },
];
