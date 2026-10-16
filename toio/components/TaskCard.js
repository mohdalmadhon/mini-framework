import { createElemant as h } from "../../src/index.js";
import { CheckIcon, CloseIcon, PaperclipIcon, ICONS } from "../icons.js";
import { isImage } from "../files.js";
import { isCut, preview, stamp, textColorFor } from "../task-utils.js";

export function TaskCard({ task, onToggle, onOpen, onRemove, onOpenPhoto }) {
    const files = task.attachments ?? [];
    const thumb = files.find(isImage);

    return h(
        "article",
        {
            key: task.id,
            class: task.done ? "task done" : "task",
            style: { backgroundColor: task.color, color: textColorFor(task.color) },
        },
        [
            h(
                "button",
                {
                    key: "check",
                    type: "button",
                    class: task.done ? "check checked" : "check",
                    "aria-label": task.done ? "Mark as undone" : "Mark as done",
                    onClick: () => onToggle(task.id),
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
                    "aria-label": `View ${task.title}`,
                    onClick: () => onOpen(task.id),
                    onKeyDown: (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onOpen(task.id);
                        }
                    },
                },
                [
                    h("h2", { class: "title" }, [preview(task.title, 32)]),
                    h("p", { class: "desc" }, [task.description ? preview(task.description, 80) : ""]),
                    h("p", { class: "when" }, [
                        h("span", { class: "stamp" }, [stamp(task.createdAt)]),
                        files.length ? h("span", { class: "chip" }, [PaperclipIcon(12), String(files.length)]) : null,
                        isCut(task) ? h("span", { class: "more" }, ["View full"]) : null,
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
                          onClick: () => onOpenPhoto(task.id, thumb.id),
                      },
                      [h("img", { src: thumb.data, alt: "" })]
                  )
                : null,
            task.icon && ICONS[task.icon] ? h("div", { key: "icon", class: "task-icon" }, [ICONS[task.icon](46)]) : null,
            h(
                "button",
                {
                    key: "remove",
                    type: "button",
                    class: "remove",
                    "aria-label": `Remove ${task.title}`,
                    onClick: () => onRemove(task.id),
                },
                [CloseIcon(14)]
            ),
        ]
    );
}
