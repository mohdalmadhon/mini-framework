import { ref, subscribe, getState } from "../../src/index.js";
import { LIMITS, SWATCHES } from "../config/constants.js";
import { clean, plural } from "../utils/text.js";
import { loadTodos, saveTodos } from "./storage.js";
import { notify } from "./notice.js";
import { celebrate } from "../decor/Confetti.js";

export const todos = ref("todos", loadTodos());

subscribe((key) => {
    if (key === "todos" && !saveTodos(getState("todos"))) {
        notify("Could not save: this browser's storage is full. Remove some files.");
    }
});

let counter = 0;

export const countLeft = (list) => list.filter((todo) => !todo.completed).length;

const allDone = (list) => list.length > 0 && countLeft(list) === 0;

export function visibleTodos(list, path) {
    if (path === "/active") return list.filter((todo) => !todo.completed);
    if (path === "/completed") return list.filter((todo) => todo.completed);
    return list;
}

export function nextColor() {
    const last = todos.value[todos.value.length - 1];
    return SWATCHES[(SWATCHES.indexOf(last?.color) + 1) % SWATCHES.length];
}

export const storageUsed = () => JSON.stringify(todos.value).length;

function setWithCheer(next) {
    const wasAllDone = allDone(todos.value);
    todos.value = next;
    if (!wasAllDone && allDone(next)) {
        celebrate();
        notify("All done. Nice work!");
    }
}

export function addTodo({ title, description = "", color, icon = null, files = [] }) {
    const text = clean(title, LIMITS.title);
    if (!text) return false;

    const todo = {
        id: `${Date.now()}-${counter++}`,
        title: text,
        description: clean(description, LIMITS.description),
        completed: false,
        color,
        icon,
        files: files.slice(0, LIMITS.files),
    };
    todos.value = [...todos.value, todo];
    return true;
}

export function updateTodo(id, patch) {
    todos.value = todos.value.map((todo) => (todo.id === id ? { ...todo, ...patch } : todo));
}

export function moveTodo(fromId, toId) {
    const list = [...todos.value];
    const from = list.findIndex((todo) => todo.id === fromId);
    const to = list.findIndex((todo) => todo.id === toId);
    if (from < 0 || to < 0 || from === to) return;
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    todos.value = list;
}

export function toggleTodo(id) {
    setWithCheer(todos.value.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
}

export function toggleAll() {
    const completed = !allDone(todos.value);
    setWithCheer(todos.value.map((todo) => ({ ...todo, completed })));
}

function removeWhere(shouldRemove, message) {
    const list = todos.value;
    const removed = list.map((todo, index) => ({ todo, index })).filter(({ todo }) => shouldRemove(todo));
    if (removed.length === 0) return;

    todos.value = list.filter((todo) => !shouldRemove(todo));
    notify(message(removed.length), () => {
        const restored = [...todos.value];
        for (const { todo, index } of removed) restored.splice(Math.min(index, restored.length), 0, todo);
        todos.value = restored;
    });
}

export const removeTodo = (id) => removeWhere((todo) => todo.id === id, () => "Todo removed");

export const clearCompleted = () =>
    removeWhere((todo) => todo.completed, (count) => `${plural(count, "completed todo")} cleared`);
