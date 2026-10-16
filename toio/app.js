import { createElemant as h, ref, getState, subscribe, on } from "../src/index.js";
import {
    ICONS,
    ICON_NAMES,
    PlusIcon,
    CheckIcon,
    CloseIcon,
    SearchIcon,
    PaperclipIcon,
    FileIcon,
    DownloadIcon,
    EditIcon,
    UndoIcon,
    Logo,
} from "./icons.js";
import { Pets } from "./pets.js";
import { Celebration, celebrate } from "./celebrate.js";
import { MAX_FILES, STORAGE_LIMIT, ACCEPT, formatSize, isImage, prepareFile, downloadAttachment } from "./files.js";

const STORAGE_KEY = "toio-tasks";
const SWATCHES = ["#b4f2dd", "#ffd58a", "#ffb4a8", "#c9c4ff", "#9fd8ff", "#f7a8d8"];

const TITLE_MAX = 50;
const DESC_MAX = 200;
const TITLE_PREVIEW = 32;
const DESC_PREVIEW = 80;
const PAGE_SIZE = 10;

function loadTasks() {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (!Array.isArray(data)) return [];
        return data.map((t) => ({
            ...t,
            attachments: Array.isArray(t.attachments)
                ? t.attachments.filter((a) => a && typeof a.data === "string")
                : [],
        }));
    } catch {
        return [];
    }
}

function saveTasks(list) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return true;
    } catch {
        return false;
    }
}

const newDraft = () => ({ title: "", description: "", color: SWATCHES[0], icon: "star" });

const tasks = ref("tasks", loadTasks());
const showForm = ref("toio:showForm", false);
const draft = ref("toio:draft", newDraft());
const pending = ref("toio:files", []);
const edit = ref("toio:edit", null);
const query = ref("toio:query", "");
const filter = ref("toio:filter", "all");
const page = ref("toio:page", 1);
const viewId = ref("toio:viewId", null);
const photo = ref("toio:photo", null);
const busy = ref("toio:busy", false);
const drag = ref("toio:drag", null);
const notice = ref("toio:notice", null);

let focusNext = null;
let searchEl = null;
let removed = [];
let noticeTimer = 0;

subscribe((key) => {
    if (key === "tasks" && !saveTasks(getState("tasks"))) {
        notify("Could not save: this browser's storage is full.");
    }
});

function notify(text, undoable = false) {
    clearTimeout(noticeTimer);
    notice.value = { id: Date.now(), text, undoable };
    noticeTimer = setTimeout(() => (notice.value = null), undoable ? 7000 : 4500);
}

function undo() {
    const list = [...tasks.value];
    for (const { task, index } of [...removed].sort((a, b) => a.index - b.index)) {
        list.splice(Math.min(index, list.length), 0, task);
    }
    removed = [];
    tasks.value = list;
    notice.value = null;
}

function toggleForm() {
    if (!showForm.value) focusNext = "form";
    showForm.value = !showForm.value;
}

function cancelForm() {
    showForm.value = false;
    draft.value = { ...newDraft(), color: draft.value.color, icon: draft.value.icon };
    pending.value = [];
}

function addTask() {
    const d = draft.value;
    const title = d.title.trim().slice(0, TITLE_MAX);
    if (!title) return;

    const task = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        title,
        description: d.description.trim().slice(0, DESC_MAX),
        color: d.color,
        icon: d.icon,
        done: false,
        createdAt: Date.now(),
        attachments: pending.value,
    };

    tasks.value = [...tasks.value, task];
    draft.value = { ...d, title: "", description: "" };
    pending.value = [];
    showForm.value = false;
    query.value = "";
    filter.value = "all";
    page.value = Math.ceil(tasks.value.length / PAGE_SIZE);
}

function toggleTask(id) {
    const wasAllDone = tasks.value.length > 0 && tasks.value.every((t) => t.done);
    tasks.value = tasks.value.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    if (!wasAllDone && tasks.value.every((t) => t.done)) celebrate("done");
}

function removeTask(id) {
    const list = tasks.value;
    const index = list.findIndex((t) => t.id === id);
    if (index < 0) return;

    removed = [{ task: list[index], index }];
    tasks.value = list.filter((t) => t.id !== id);
    if (viewId.value === id) closeDialog();
    notify("Task removed", true);
}

function setAll(done) {
    const wasAllDone = tasks.value.length > 0 && tasks.value.every((t) => t.done);
    tasks.value = tasks.value.map((t) => ({ ...t, done }));
    if (done && !wasAllDone && tasks.value.length > 0) celebrate("done");
}

function removeAll() {
    const list = tasks.value;
    if (list.length === 0) return;

    removed = list.map((task, index) => ({ task, index }));
    tasks.value = [];
    closeDialog();
    notify(`${list.length} task${list.length === 1 ? "" : "s"} removed`, true);
    celebrate("clear");
}

function openTask(id) {
    edit.value = null;
    viewId.value = id;
}

function closeDialog() {
    viewId.value = null;
    edit.value = null;
}

function startEdit(t) {
    focusNext = "edit";
    edit.value = { title: t.title, description: t.description, color: t.color, icon: t.icon };
}

function saveEdit() {
    const e = edit.value;
    const id = viewId.value;
    if (!e || id === null) return;

    const title = e.title.trim().slice(0, TITLE_MAX);
    if (!title) return;

    tasks.value = tasks.value.map((t) =>
        t.id === id
            ? { ...t, title, description: e.description.trim().slice(0, DESC_MAX), color: e.color, icon: e.icon }
            : t
    );
    edit.value = null;
}

function attachmentsOf(taskId) {
    if (taskId === null) return pending.value;
    return tasks.value.find((t) => t.id === taskId)?.attachments ?? [];
}

async function attach(files, taskId) {
    if (files.length === 0) return;

    busy.value = true;
    const problems = [];

    for (const file of files) {
        if (attachmentsOf(taskId).length >= MAX_FILES) {
            problems.push(`Only ${MAX_FILES} files per task.`);
            break;
        }

        try {
            const att = await prepareFile(file);
            const used = JSON.stringify(tasks.value).length + JSON.stringify(pending.value).length;
            if (used + att.data.length > STORAGE_LIMIT) {
                problems.push("Browser storage is almost full. Remove some files first.");
                break;
            }

            if (taskId === null) {
                pending.value = [...pending.value, att];
            } else {
                tasks.value = tasks.value.map((t) =>
                    t.id === taskId ? { ...t, attachments: [...(t.attachments ?? []), att] } : t
                );
            }
        } catch (error) {
            problems.push(error instanceof Error ? error.message : "Could not add the file.");
        }
    }

    busy.value = false;
    if (problems.length) notify(problems[0]);
}

function removeAttachment(taskId, attId) {
    if (taskId === null) {
        pending.value = pending.value.filter((a) => a.id !== attId);
        return;
    }
    tasks.value = tasks.value.map((t) =>
        t.id === taskId ? { ...t, attachments: (t.attachments ?? []).filter((a) => a.id !== attId) } : t
    );
}

function stepPhoto(dir) {
    const p = photo.value;
    if (!p) return;
    const images = attachmentsOf(p.taskId).filter(isImage);
    const i = images.findIndex((a) => a.id === p.attId);
    if (i < 0 || images.length < 2) return;
    photo.value = { taskId: p.taskId, attId: images[(i + dir + images.length) % images.length].id };
}

on("keydown", (e) => {
    if (e.key === "Escape") {
        if (photo.value) photo.value = null;
        else if (viewId.value !== null) closeDialog();
        return;
    }

    if (photo.value) {
        if (e.key === "ArrowRight") stepPhoto(1);
        else if (e.key === "ArrowLeft") stepPhoto(-1);
        return;
    }

    if (!searchEl?.isConnected || viewId.value !== null) return;
    const el = e.target;
    const typing = el instanceof HTMLElement && (el.matches("input, textarea, select") || el.isContentEditable);
    if (typing || e.ctrlKey || e.metaKey || e.altKey) return;

    if (e.key === "/") {
        e.preventDefault();
        searchEl.focus();
    } else if (e.key.toLowerCase() === "n" && !showForm.value) {
        e.preventDefault();
        toggleForm();
    }
});

const preview = (text, max) => {
    const flat = text.replace(/\s+/g, " ").trim();
    return flat.length > max ? `${flat.slice(0, max).trimEnd()}...` : flat;
};

const isCut = (t) => t.title.length > TITLE_PREVIEW || t.description.length > DESC_PREVIEW || t.description.includes("\n");

export function textColorFor(hex) {
    const n = parseInt(hex.slice(1), 16);
    const luma = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
    return luma > 150 ? "#1f3a3d" : "#ffffff";
}

const dayLabel = (d) =>
    `${d.toLocaleDateString("en-US", { weekday: "short" })} - ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

const stamp = (ts) => {
    const d = new Date(ts);
    const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    return `${time} ${d.toLocaleDateString("en-US", { weekday: "short" })} (${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;
};

const counterClass = (length, max) => (length >= max * 0.9 ? "counter warn" : "counter");

function Fields(d, patch, owner, onEnter) {
    return [
        h("input", {
            class: "field title-input",
            type: "text",
            maxlength: String(TITLE_MAX),
            placeholder: "Task title",
            "aria-label": "Task title",
            value: d.title,
            onInput: (e) => patch({ title: e.target.value }),
            onKeyDown: (e) => e.key === "Enter" && onEnter(),
            ref: (el) => {
                if (focusNext === owner) {
                    focusNext = null;
                    el.focus();
                }
            },
        }),
        h("p", { class: counterClass(d.title.length, TITLE_MAX) }, [`${d.title.length}/${TITLE_MAX}`]),
        h("textarea", {
            class: "field",
            rows: "3",
            maxlength: String(DESC_MAX),
            placeholder: "Description (optional)",
            "aria-label": "Task description",
            value: d.description,
            onInput: (e) => patch({ description: e.target.value }),
        }),
        h("p", { class: counterClass(d.description.length, DESC_MAX) }, [`${d.description.length}/${DESC_MAX}`]),
        h("div", { class: "row" }, [
            h("span", { class: "label" }, ["Color"]),
            h(
                "div",
                { class: "swatches" },
                SWATCHES.map((c) =>
                    h("button", {
                        key: c,
                        type: "button",
                        class: d.color === c ? "swatch selected" : "swatch",
                        style: { backgroundColor: c },
                        "aria-label": `Color ${c}`,
                        onClick: () => patch({ color: c }),
                    })
                )
            ),
            h("input", {
                class: "color-input",
                type: "color",
                "aria-label": "Pick a color",
                value: d.color,
                onInput: (e) => patch({ color: e.target.value }),
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
                            class: d.icon === name ? "icon-btn selected" : "icon-btn",
                            "aria-label": `Icon ${name}`,
                            onClick: () => patch({ icon: d.icon === name ? null : name }),
                        },
                        [ICONS[name](30)]
                    )
                )
            ),
        ]),
    ];
}

const FileList = (taskId, items) =>
    h(
        "ul",
        { class: "files" },
        items.map((a) =>
            h("li", { key: a.id, class: "file" }, [
                h(
                    "button",
                    {
                        type: "button",
                        class: "file-main",
                        title: isImage(a) ? "View photo" : "Download",
                        onClick: () => (isImage(a) ? (photo.value = { taskId, attId: a.id }) : downloadAttachment(a)),
                    },
                    [
                        isImage(a)
                            ? h("img", { class: "file-thumb", src: a.data, alt: "" })
                            : h("span", { class: "file-doc" }, [FileIcon(20)]),
                        h("span", { class: "file-text" }, [
                            h("span", { class: "file-name" }, [a.name]),
                            h("span", { class: "file-size" }, [formatSize(a.size)]),
                        ]),
                        isImage(a) ? null : h("span", { class: "file-dl" }, [DownloadIcon(16)]),
                    ]
                ),
                h(
                    "button",
                    {
                        type: "button",
                        class: "file-remove",
                        "aria-label": `Remove ${a.name}`,
                        onClick: () => removeAttachment(taskId, a.id),
                    },
                    [CloseIcon(12)]
                ),
            ])
        )
    );

const AttachArea = (taskId, items) => {
    const areaId = taskId ?? "form";
    const full = items.length >= MAX_FILES;

    return h(
        "div",
        {
            class: drag.value === areaId ? "attach-area dragging" : "attach-area",
            onDragOver: (e) => {
                e.preventDefault();
                drag.value = areaId;
            },
            onDragLeave: (e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) drag.value = null;
            },
            onDrop: (e) => {
                e.preventDefault();
                drag.value = null;
                attach(Array.from(e.dataTransfer?.files ?? []), taskId);
            },
        },
        [
            h("div", { class: "attach-head" }, [
                h("span", { class: "label wide" }, [`Files ${items.length}/${MAX_FILES}`]),
                h("label", { class: full ? "btn attach disabled" : "btn attach" }, [
                    PaperclipIcon(18),
                    "Add files",
                    h("input", {
                        class: "sr-only",
                        type: "file",
                        multiple: true,
                        accept: ACCEPT,
                        disabled: full,
                        onChange: (e) => {
                            const chosen = Array.from(e.target.files ?? []);
                            e.target.value = "";
                            attach(chosen, taskId);
                        },
                    }),
                ]),
                busy.value ? h("span", { class: "hint" }, ["Adding..."]) : null,
            ]),
            items.length
                ? FileList(taskId, items)
                : h("p", { class: "hint" }, [
                      taskId === null
                          ? "Drop photos or documents here (up to 1.5 MB each)."
                          : "No files yet. Drop some here.",
                  ]),
        ]
    );
};

export function ToioApp() {
    const list = tasks.value;
    const doneCount = list.filter((t) => t.done).length;
    const percent = list.length ? Math.round((doneCount / list.length) * 100) : 0;

    const tab = filter.value;
    const byTab = list.filter((t) => tab === "all" || (tab === "done" ? t.done : !t.done));
    const needle = query.value.trim().toLowerCase();
    const filtered = needle
        ? byTab.filter(
              (t) =>
                  t.title.toLowerCase().includes(needle) ||
                  t.description.toLowerCase().includes(needle) ||
                  (t.attachments ?? []).some((a) => a.name.toLowerCase().includes(needle))
          )
        : byTab;
    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(Math.max(1, page.value), pageCount);
    const pageTasks = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const viewed = viewId.value === null ? null : (list.find((t) => t.id === viewId.value) ?? null);

    const goTo = (n) => (page.value = Math.min(Math.max(1, n), pageCount));
    const setQuery = (text) => {
        query.value = text;
        page.value = 1;
    };
    const setFilter = (name) => {
        filter.value = name;
        page.value = 1;
    };

    const Form = () =>
        h("div", { key: "form", class: "sheet" }, [
            ...Fields(draft.value, (c) => (draft.value = { ...draft.value, ...c }), "form", addTask),
            AttachArea(null, pending.value),
            h("div", { class: "row actions" }, [
                h("button", { type: "button", class: "btn", onClick: cancelForm }, ["Cancel"]),
                h(
                    "button",
                    { type: "button", class: "btn primary", disabled: !draft.value.title.trim(), onClick: addTask },
                    ["Add task", CheckIcon(18)]
                ),
            ]),
        ]);

    const TaskCard = (t) => {
        const files = t.attachments ?? [];
        const thumb = files.find(isImage);

        return h(
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
                        key: "check",
                        type: "button",
                        class: t.done ? "check checked" : "check",
                        "aria-label": t.done ? "Mark as undone" : "Mark as done",
                        onClick: () => toggleTask(t.id),
                    },
                    [CheckIcon(16)]
                ),
                h(
                    "div",
                    {
                        key: "body",
                        class: "body",
                        role: "button",
                        tabindex: "0",
                        title: "View task",
                        "aria-label": `View ${t.title}`,
                        onClick: () => openTask(t.id),
                        onKeyDown: (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                openTask(t.id);
                            }
                        },
                    },
                    [
                        h("h2", { class: "title" }, [preview(t.title, TITLE_PREVIEW)]),
                        h("p", { class: "desc" }, [t.description ? preview(t.description, DESC_PREVIEW) : ""]),
                        h("p", { class: "when" }, [
                            h("span", { class: "stamp" }, [stamp(t.createdAt)]),
                            files.length ? h("span", { class: "chip" }, [PaperclipIcon(12), String(files.length)]) : null,
                            isCut(t) ? h("span", { class: "more" }, ["View full"]) : null,
                        ]),
                    ]
                ),
                thumb
                    ? h(
                          "button",
                          {
                              key: "thumb",
                              type: "button",
                              class: "card-thumb",
                              "aria-label": `View photo ${thumb.name}`,
                              onClick: () => (photo.value = { taskId: t.id, attId: thumb.id }),
                          },
                          [h("img", { src: thumb.data, alt: "" })]
                      )
                    : null,
                t.icon && ICONS[t.icon] ? h("div", { key: "icon", class: "task-icon" }, [ICONS[t.icon](46)]) : null,
                h(
                    "button",
                    {
                        key: "remove",
                        type: "button",
                        class: "remove",
                        "aria-label": `Remove ${t.title}`,
                        onClick: () => removeTask(t.id),
                    },
                    [CloseIcon(14)]
                ),
            ]
        );
    };

    const TaskDialog = (t) => {
        const e = edit.value;
        const color = e ? e.color : t.color;

        return h(
            "div",
            {
                key: "dialog",
                class: "overlay",
                onClick: (ev) => {
                    if (ev.target === ev.currentTarget) closeDialog();
                },
            },
            [
                h(
                    "div",
                    {
                        class: t.done && !e ? "dialog done" : "dialog",
                        role: "dialog",
                        "aria-modal": "true",
                        "aria-label": t.title,
                        style: { backgroundColor: color, color: textColorFor(color) },
                    },
                    [
                        e
                            ? h("div", { class: "dialog-form" }, [
                                  ...Fields(e, (c) => (edit.value = { ...edit.value, ...c }), "edit", saveEdit),
                              ])
                            : [
                                  h("div", { class: "dialog-head" }, [
                                      t.icon && ICONS[t.icon]
                                          ? h("div", { class: "task-icon" }, [ICONS[t.icon](46)])
                                          : null,
                                      h("h2", { class: "dialog-title" }, [t.title]),
                                      h(
                                          "button",
                                          { type: "button", class: "remove", "aria-label": "Close", onClick: closeDialog },
                                          [CloseIcon(14)]
                                      ),
                                  ]),
                                  h("p", { class: "dialog-desc" }, [t.description || "No description."]),
                                  h("p", { class: "when" }, [stamp(t.createdAt)]),
                              ],
                        AttachArea(t.id, t.attachments ?? []),
                        h(
                            "div",
                            { class: "row actions" },
                            e
                                ? [
                                      h("button", { type: "button", class: "btn", onClick: () => (edit.value = null) }, ["Cancel"]),
                                      h(
                                          "button",
                                          { type: "button", class: "btn primary", disabled: !e.title.trim(), onClick: saveEdit },
                                          ["Save", CheckIcon(18)]
                                      ),
                                  ]
                                : [
                                      h("button", { type: "button", class: "btn", onClick: () => startEdit(t) }, [
                                          EditIcon(16),
                                          "Edit",
                                      ]),
                                      h("button", { type: "button", class: "btn primary", onClick: () => toggleTask(t.id) }, [
                                          t.done ? "Mark as undone" : "Mark as done",
                                          CheckIcon(18),
                                      ]),
                                      h("button", { type: "button", class: "btn", onClick: closeDialog }, ["Close"]),
                                  ]
                        ),
                    ]
                ),
            ]
        );
    };

    const Lightbox = () => {
        const p = photo.value;
        if (!p) return null;

        const images = attachmentsOf(p.taskId).filter(isImage);
        const i = images.findIndex((a) => a.id === p.attId);
        const a = images[i];
        if (!a) return null;

        return h(
            "div",
            {
                key: "lightbox",
                class: "overlay lightbox",
                onClick: (ev) => {
                    if (ev.target === ev.currentTarget || ev.target.tagName === "FIGURE") photo.value = null;
                },
            },
            [
                h("figure", { class: "lightbox-fig" }, [
                    h("img", { class: "lightbox-img", src: a.data, alt: a.name }),
                    h("figcaption", {}, [`${a.name} (${i + 1}/${images.length})`]),
                ]),
                h(
                    "button",
                    { type: "button", class: "lb-btn lb-close", "aria-label": "Close photo", onClick: () => (photo.value = null) },
                    [CloseIcon(18)]
                ),
                h(
                    "button",
                    { type: "button", class: "lb-btn lb-save", "aria-label": "Download photo", onClick: () => downloadAttachment(a) },
                    [DownloadIcon(18)]
                ),
                images.length > 1
                    ? h("button", { type: "button", class: "lb-btn lb-prev", "aria-label": "Previous photo", onClick: () => stepPhoto(-1) }, ["<"])
                    : null,
                images.length > 1
                    ? h("button", { type: "button", class: "lb-btn lb-next", "aria-label": "Next photo", onClick: () => stepPhoto(1) }, [">"])
                    : null,
            ]
        );
    };

    const Pagination = () => {
        const first = Math.max(1, Math.min(currentPage - 2, pageCount - 4));
        const last = Math.min(pageCount, first + 4);
        const numbers = [];
        for (let n = first; n <= last; n++) numbers.push(n);

        return h("nav", { class: "pager", "aria-label": "Pages" }, [
            h("button", { type: "button", class: "btn", disabled: currentPage === 1, onClick: () => goTo(currentPage - 1) }, ["Prev"]),
            ...numbers.map((n) =>
                h(
                    "button",
                    {
                        key: n,
                        type: "button",
                        class: n === currentPage ? "btn page current" : "btn page",
                        "aria-label": `Page ${n}`,
                        "aria-current": n === currentPage ? "page" : null,
                        onClick: () => goTo(n),
                    },
                    [String(n)]
                )
            ),
            h(
                "button",
                { type: "button", class: "btn", disabled: currentPage === pageCount, onClick: () => goTo(currentPage + 1) },
                ["Next"]
            ),
        ]);
    };

    const toast = notice.value;

    return h("div", { class: "app" }, [
        h("header", { class: "top" }, [
            h("div", { class: "brand", title: "TOIO" }, [Logo(54)]),
            h("div", { class: "top-text" }, [
                h("h1", {}, [h("span", { class: "today" }, ["Today"]), ` ${dayLabel(new Date())}`]),
                h("p", { class: "summary" }, [`${doneCount} of ${list.length} done`]),
                h(
                    "div",
                    {
                        class: "progress",
                        role: "progressbar",
                        "aria-label": "Tasks done",
                        "aria-valuemin": "0",
                        "aria-valuemax": "100",
                        "aria-valuenow": String(percent),
                    },
                    [h("div", { class: "progress-bar", style: { width: `${percent}%` } })]
                ),
            ]),
            h(
                "button",
                {
                    type: "button",
                    class: showForm.value ? "add-btn open" : "add-btn",
                    "aria-label": "Add a task",
                    title: "Add a task (n)",
                    onClick: toggleForm,
                },
                [PlusIcon()]
            ),
        ]),
        h("section", { class: "toolbar" }, [
            h("button", { type: "button", class: "btn", disabled: doneCount === 0, onClick: () => setAll(false) }, ["Undone all"]),
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
            h("button", { type: "button", class: "btn danger", disabled: list.length === 0, onClick: removeAll }, ["Remove all"]),
        ]),
        h("section", { class: "controls" }, [
            h("div", { class: "search" }, [
                h("span", { class: "search-icon" }, [SearchIcon(18)]),
                h("input", {
                    class: "search-input",
                    type: "search",
                    placeholder: "Search tasks (press /)",
                    "aria-label": "Search tasks",
                    value: query.value,
                    onInput: (e) => setQuery(e.target.value),
                    onKeyDown: (e) => {
                        if (e.key === "Escape") {
                            setQuery("");
                            e.target.blur();
                        }
                    },
                    ref: (el) => (searchEl = el),
                }),
                query.value
                    ? h(
                          "button",
                          { type: "button", class: "search-clear", "aria-label": "Clear search", onClick: () => setQuery("") },
                          [CloseIcon(14)]
                      )
                    : null,
                needle ? h("span", { class: "found" }, [`${filtered.length} found`]) : null,
            ]),
            h(
                "div",
                { class: "tabs", role: "group", "aria-label": "Filter tasks" },
                [
                    ["all", "All", list.length],
                    ["active", "Active", list.length - doneCount],
                    ["done", "Done", doneCount],
                ].map(([key, label, count]) =>
                    h(
                        "button",
                        {
                            key,
                            type: "button",
                            class: tab === key ? "tab current" : "tab",
                            "aria-pressed": String(tab === key),
                            onClick: () => setFilter(key),
                        },
                        [label, h("span", { class: "count" }, [String(count)])]
                    )
                )
            ),
        ]),
        h("main", { class: "list" }, [
            showForm.value ? Form() : null,
            ...pageTasks.map(TaskCard),
            list.length === 0 && !showForm.value
                ? h("div", { key: "empty", class: "empty-state" }, [
                      h(
                          "button",
                          {
                              type: "button",
                              class: "big-add",
                              "aria-label": "Add your first task",
                              onClick: toggleForm,
                          },
                          [
                              h("span", { class: "big-add-plus" }, [PlusIcon()]),
                              h("span", { class: "big-add-text" }, ["Add a task"]),
                          ]
                      ),
                      h("p", { class: "empty" }, ["Nothing to do yet. Tap the button to add your first task."]),
                  ])
                : null,
            list.length > 0 && filtered.length === 0
                ? h("p", { class: "empty" }, [
                      needle ? `No task matches "${query.value.trim()}".` : "Nothing here yet.",
                  ])
                : null,
        ]),
        pageCount > 1 ? Pagination() : null,
        viewed ? TaskDialog(viewed) : null,
        Lightbox(),
        Celebration(),
        Pets(),
        toast
            ? h("div", { key: `toast-${toast.id}`, class: "toast", role: "status", "aria-live": "polite" }, [
                  h("span", { class: "toast-text" }, [toast.text]),
                  toast.undoable
                      ? h("button", { type: "button", class: "toast-btn", onClick: undo }, [UndoIcon(16), "Undo"])
                      : null,
                  h(
                      "button",
                      { type: "button", class: "toast-x", "aria-label": "Dismiss", onClick: () => (notice.value = null) },
                      [CloseIcon(12)]
                  ),
              ])
            : null,
    ]);
}
