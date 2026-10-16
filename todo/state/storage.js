import { STORAGE_KEY, LIMITS, SWATCHES } from "../config/constants.js";
import { isHexColor } from "../utils/color.js";
import { clean } from "../utils/text.js";
import { isTaskIcon } from "../icons/task-icons.js";

function readFile(file) {
    if (!file || typeof file.name !== "string" || typeof file.data !== "string" || !file.data.startsWith("data:")) {
        return null;
    }
    return {
        id: String(file.id),
        name: file.name.slice(0, LIMITS.fileName),
        type: typeof file.type === "string" ? file.type : "",
        size: Number(file.size) || 0,
        data: file.data,
    };
}

function readTodo(item, index) {
    const title = clean(item?.title, LIMITS.title);
    if (!title) return null;

    return {
        id: typeof item.id === "string" ? item.id : `saved-${index}`,
        title,
        description: clean(item.description, LIMITS.description),
        completed: Boolean(item.completed),
        color: isHexColor(item.color) ? item.color : SWATCHES[index % SWATCHES.length],
        icon: isTaskIcon(item.icon) ? item.icon : null,
        files: Array.isArray(item.files) ? item.files.map(readFile).filter(Boolean).slice(0, LIMITS.files) : [],
    };
}

export function loadTodos() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(saved) ? saved.map(readTodo).filter(Boolean) : [];
    } catch {
        return [];
    }
}

export function saveTodos(todos) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
        return true;
    } catch {
        return false;
    }
}
