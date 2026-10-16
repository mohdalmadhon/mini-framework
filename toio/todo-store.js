import { getState, ref, subscribe } from "../src/index.js";

const STORAGE_KEY = "toio-todos";
const TODOS_KEY = "toio:todos";

function loadTodos() {
    let stored;
    try {
        stored = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
        console.error("Could not read saved todos.", error);
        return [];
    }

    if (stored === null) return [];

    try {
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) throw new TypeError("Saved todos must be an array.");
        return parsed.filter(
            (todo) =>
                todo &&
                (typeof todo.id === "string" || typeof todo.id === "number") &&
                typeof todo.title === "string" &&
                typeof todo.completed === "boolean"
        );
    } catch (error) {
        console.error("Could not parse saved todos.", error);
        return [];
    }
}

export const todos = ref(TODOS_KEY, loadTodos());
export const newTodo = ref("toio:newTodo", "");
export const editingId = ref("toio:editingId", null);
export const editingTitle = ref("toio:editingTitle", "");

subscribe((key) => {
    if (key !== TODOS_KEY) return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(getState(TODOS_KEY)));
    } catch (error) {
        console.error("Could not save todos.", error);
    }
});

export function addTodo(title) {
    const text = title.trim();
    if (!text) return;
    todos.value = [...todos.value, { id: `${Date.now()}-${Math.random()}`, title: text, completed: false }];
    newTodo.value = "";
}

export function toggleTodo(id) {
    todos.value = todos.value.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo));
}

export function toggleAll(completed) {
    todos.value = todos.value.map((todo) => ({ ...todo, completed }));
}

export function removeTodo(id) {
    todos.value = todos.value.filter((todo) => todo.id !== id);
    if (editingId.value === id) cancelEdit();
}

export function clearCompleted() {
    todos.value = todos.value.filter((todo) => !todo.completed);
}

export function startEdit(todo) {
    editingId.value = todo.id;
    editingTitle.value = todo.title;
}

export function updateEdit(title) {
    editingTitle.value = title;
}

export function saveEdit(id) {
    if (editingId.value !== id) return;
    const title = editingTitle.value.trim();
    if (title) {
        todos.value = todos.value.map((todo) => (todo.id === id ? { ...todo, title } : todo));
    } else {
        todos.value = todos.value.filter((todo) => todo.id !== id);
    }
    editingId.value = null;
    editingTitle.value = "";
}

export function cancelEdit() {
    editingId.value = null;
    editingTitle.value = "";
}
