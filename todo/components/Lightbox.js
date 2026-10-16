import { createElemant as h } from "../../src/index.js";
import { formatSize, downloadFile } from "../utils/files.js";
import { viewer, closeViewer } from "../state/viewer.js";
import { CloseIcon, DownloadIcon } from "../icons/ui-icons.js";

export function Lightbox() {
    const file = viewer.value;
    if (!file) return null;

    return h(
        "div",
        {
            key: "lightbox",
            class: "overlay lightbox",
            onClick: (event) => {
                if (event.target === event.currentTarget || event.target.tagName === "FIGURE") closeViewer();
            },
        },
        [
            h("figure", { class: "lightbox-figure" }, [
                h("img", { class: "lightbox-img", src: file.data, alt: file.name }),
                h("figcaption", {}, [`${file.name} (${formatSize(file.size)})`]),
            ]),
            h("div", { class: "lightbox-tools" }, [
                h("button", { type: "button", class: "icon-btn", "aria-label": "Download", onClick: () => downloadFile(file) }, [
                    DownloadIcon(18),
                ]),
                h("button", { type: "button", class: "icon-btn", "aria-label": "Close photo", onClick: closeViewer }, [
                    CloseIcon(18),
                ]),
            ]),
        ]
    );
}
