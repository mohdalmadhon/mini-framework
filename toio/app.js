/**
 * TOIO - "the simplest todo app ever", built with the mini-framework.
 *
 * Tasks (title, description, color, icon, done) live in the global state and
 * are saved to localStorage on every change.
 */
import { createElemant as h, ref, getState, subscribe } from "../src/index.js";
import { ICONS, ICON_NAMES, PlusIcon, CheckIcon, CloseIcon } from "./icons.js";

/**
 * @typedef {Object} Task
 * @property {number} id
 * @property {string} title
 * @property {string} description
 * @property {string} color - Hex color, e.g. `"#b4f2dd"`.
 * @property {string|null} icon - Key of {@link ICONS}, or `null`.
 * @property {boolean} done
 * @property {number} createdAt - Timestamp (ms).
 */

const STORAGE_KEY = "toio-tasks";
const SWATCHES = ["#b4f2dd", "#ffd58a", "#ffb4a8", "#c9c4ff", "#9fd8ff", "#f7a8d8"];

/**
 * Reads the saved tasks.
 *
 * @returns {Task[]} Saved tasks, or an empty list.
 */
function loadTasks() {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

/**
 * Saves tasks to localStorage (ignores quota / privacy-mode errors).
 *
 * @param {Task[]} tasks
 * @returns {void}
 */
function saveTasks(tasks) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
        /* storage unavailable: the app still works in memory */
    }
}

const initialTasks = loadTasks();

// Save whenever the "tasks" state changes.
subscribe((key) => {
    if (key === "tasks") saveTasks(getState("tasks"));
});

let focusTitleNext = false;

/**
 * Picks a readable text color (dark or light) for a background color.
 *
 * @param {string} hex - `#rrggbb`.
 * @returns {string} A text color.
 */
export function textColorFor(hex) {
    const n = parseInt(hex.slice(1), 16);
    const luma = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
    return luma > 150 ? "#1f3a3d" : "#ffffff";
}

/**
 * @param {Date} d
 * @returns {string} `"Mon - Oct 16"`.
 */
const dayLabel = (d) =>
    `${d.toLocaleDateString("en-US", { weekday: "short" })} - ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

/**
 * @param {number} ts - Timestamp (ms).
 * @returns {string} `"16:00 Mon (Oct 16)"`.
 */
const stamp = (ts) => {
    const d = new Date(ts);
    const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    return `${time} ${d.toLocaleDateString("en-US", { weekday: "short" })} (${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;
};

/**
 * Root component of the TOIO app.
 *
 * @returns {import("../src/index.js").VElement}
 */
export function ToioApp() {
    const tasks = ref("tasks", initialTasks);
    const showForm = ref("toio:showForm", false);
    const title = ref("toio:title", "");
    const description = ref("toio:description", "");
    const color = ref("toio:color", SWATCHES[0]);
    const icon = ref("toio:icon", "star");

    const list = tasks.value;
    const doneCount = list.filter((t) => t.done).length;

    const toggleForm = () => {
        focusTitleNext = !showForm.value;
        showForm.value = !showForm.value;
    };

    const addTask = () => {
        const text = title.value.trim();
        if (!text) return;

        /** @type {Task} */
        const task = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            title: text,
            description: description.value.trim(),
            color: color.value,
            icon: icon.value,
            done: false,
            createdAt: Date.now(),
        };

        tasks.value = [...list, task];
        title.value = "";
        description.value = "";
        showForm.value = false;
    };

    /** @param {number} id */
    const toggleTask = (id) => {
        tasks.value = list.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    };

    /** @param {number} id */
    const removeTask = (id) => {
        tasks.value = list.filter((t) => t.id !== id);
    };

    /** @param {boolean} done */
    const setAll = (done) => {
        tasks.value = list.map((t) => ({ ...t, done }));
    };

    const removeAll = () => {
        if (window.confirm("Remove all tasks?")) tasks.value = [];
    };

    const Form = () =>
        h("div", { key: "form", class: "sheet" }, [
            h("input", {
                class: "field title-input",
                type: "text",
                maxlength: "60",
                placeholder: "Task title",
                "aria-label": "Task title",
                value: title.value,
                onInput: (e) => (title.value = e.target.value),
                onKeyDown: (e) => e.key === "Enter" && addTask(),
                ref: (el) => {
                    if (focusTitleNext) {
                        focusTitleNext = false;
                        el.focus();
                    }
                },
            }),
            h("textarea", {
                class: "field",
                rows: "2",
                placeholder: "Description (optional)",
                "aria-label": "Task description",
                value: description.value,
                onInput: (e) => (description.value = e.target.value),
            }),
            h("div", { class: "row" }, [
                h("span", { class: "label" }, ["Color"]),
                h(
                    "div",
                    { class: "swatches" },
                    SWATCHES.map((c) =>
                        h("button", {
                            key: c,
                            type: "button",
                            class: color.value === c ? "swatch selected" : "swatch",
                            style: { backgroundColor: c },
                            "aria-label": `Color ${c}`,
                            onClick: () => (color.value = c),
                        })
                    )
                ),
                h("input", {
                    class: "color-input",
                    type: "color",
                    "aria-label": "Pick a color",
                    value: color.value,
                    onInput: (e) => (color.value = e.target.value),
                }),
            ]),
            h("div", { class: "row" }, [
                h("span", { class: "label" }, ["Icon"]),
                h(
                    "div",
                    { class: "icons" },
                    ICON_NAMES.map((name) =>
                        h(
                            "button",
                            {
                                key: name,
                                type: "button",
                                class: icon.value === name ? "icon-btn selected" : "icon-btn",
                                "aria-label": `Icon ${name}`,
                                onClick: () => (icon.value = icon.value === name ? null : name),
                            },
                            [ICONS[name](30)]
                        )
                    )
                ),
            ]),
            h("div", { class: "row actions" }, [
                h("button", { type: "button", class: "btn", onClick: toggleForm }, ["Cancel"]),
                h(
                    "button",
                    { type: "button", class: "btn primary", disabled: !title.value.trim(), onClick: addTask },
                    ["Add task", CheckIcon(18)]
                ),
            ]),
        ]);

    /** @param {Task} t */
    const TaskCard = (t) =>
        h(
            "article",
            {
                key: t.id,
                class: t.done ? "task done" : "task",
                style: { backgroundColor: t.color, color: textColorFor(t.color) },
            },
            [
                h(
                    "button",
                    {
                        type: "button",
                        class: t.done ? "check checked" : "check",
                        "aria-label": t.done ? "Mark as undone" : "Mark as done",
                        onClick: () => toggleTask(t.id),
                    },
                    [CheckIcon(16)]
                ),
                h("div", { class: "body" }, [
                    h("h2", { class: "title" }, [t.title]),
                    t.description ? h("p", { class: "desc" }, [t.description]) : null,
                    h("p", { class: "when" }, [stamp(t.createdAt)]),
                ]),
                t.icon && ICONS[t.icon] ? h("div", { class: "task-icon" }, [ICONS[t.icon](46)]) : null,
                h(
                    "button",
                    {
                        type: "button",
                        class: "remove",
                        "aria-label": `Remove ${t.title}`,
                        onClick: () => removeTask(t.id),
                    },
                    [CloseIcon(14)]
                ),
            ]
        );

    return h("div", { class: "app" }, [
        h("header", { class: "top" }, [
            h("div", {}, [
                h("h1", {}, [h("span", { class: "today" }, ["Today"]), ` ${dayLabel(new Date())}`]),
                h("p", { class: "summary" }, [`${doneCount} of ${list.length} done`]),
            ]),
            h(
                "button",
                {
                    type: "button",
                    class: showForm.value ? "add-btn open" : "add-btn",
                    "aria-label": "Add a task",
                    onClick: toggleForm,
                },
                [PlusIcon()]
            ),
        ]),
        h("section", { class: "toolbar" }, [
            h(
                "button",
                { type: "button", class: "btn", disabled: doneCount === 0, onClick: () => setAll(false) },
                ["Undone all"]
            ),
            h(
                "button",
                {
                    type: "button",
                    class: "btn primary",
                    disabled: list.length === 0 || doneCount === list.length,
                    onClick: () => setAll(true),
                },
                ["Done all", CheckIcon(18)]
            ),
            h(
                "button",
                { type: "button", class: "btn danger", disabled: list.length === 0, onClick: removeAll },
                ["Remove all"]
            ),
        ]),
        h("main", { class: "list" }, [
            showForm.value ? Form() : null,
            ...list.map(TaskCard),
            list.length === 0 && !showForm.value
                ? h("p", { class: "empty" }, ["No tasks yet. Click + to add your first one."])
                : null,
        ]),
    ]);
}
