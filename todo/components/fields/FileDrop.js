import { createElemant as h } from "../../../src/index.js";
import { ACCEPT, LIMITS } from "../../config/constants.js";
import { formatSize } from "../../utils/files.js";
import { busy, dragOver, attachFiles } from "../../state/attachments.js";
import { PaperclipIcon } from "../../icons/ui-icons.js";
import { FileList } from "./FileList.js";

export function FileDrop(target, onRemove) {
    const files = target.get();
    const full = files.length >= LIMITS.files;

    return h(
        "div",
        {
            class: dragOver.value === target.id ? "field file-drop dragging" : "field file-drop",
            onDragOver: (event) => {
                event.preventDefault();
                dragOver.value = target.id;
            },
            onDragLeave: (event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) dragOver.value = null;
            },
            onDrop: (event) => {
                event.preventDefault();
                dragOver.value = null;
                attachFiles(Array.from(event.dataTransfer?.files ?? []), target);
            },
        },
        [
            h("div", { class: "field-head" }, [
                h("span", { class: "field-label" }, ["Files"]),
                h("span", { class: full ? "char-count warn" : "char-count" }, [`${files.length}/${LIMITS.files}`]),
            ]),
            h("div", { class: "file-drop-row" }, [
                h("label", { class: full ? "btn small disabled" : "btn small" }, [
                    PaperclipIcon(16),
                    "Add files",
                    h("input", {
                        class: "sr-only",
                        type: "file",
                        multiple: true,
                        accept: ACCEPT,
                        disabled: full,
                        onChange: (event) => {
                            const chosen = Array.from(event.target.files ?? []);
                            event.target.value = "";
                            attachFiles(chosen, target);
                        },
                    }),
                ]),
                h("span", { class: "hint" }, [
                    busy.value
                        ? "Adding..."
                        : `or drop them here. Up to ${LIMITS.files} files, ${formatSize(LIMITS.fileBytes)} each (photos are shrunk).`,
                ]),
            ]),
            files.length > 0 ? FileList(files, onRemove) : null,
        ]
    );
}
