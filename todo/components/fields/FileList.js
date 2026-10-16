import { createElemant as h } from "../../../src/index.js";
import { formatSize, isImage, downloadFile } from "../../utils/files.js";
import { openViewer } from "../../state/viewer.js";
import { CloseIcon, FileIcon } from "../../icons/ui-icons.js";

export function FileList(files, onRemove = null) {
    return h(
        "div",
        { class: "file-list", role: "list" },
        files.map((file) =>
            h("div", { key: file.id, class: "file-chip", role: "listitem" }, [
                h(
                    "button",
                    {
                        type: "button",
                        class: "file-open",
                        title: isImage(file) ? `View ${file.name}` : `Download ${file.name}`,
                        onClick: (event) => {
                            event.stopPropagation();
                            if (isImage(file)) openViewer(file);
                            else downloadFile(file);
                        },
                    },
                    [
                        isImage(file)
                            ? h("img", { class: "file-thumb", src: file.data, alt: "" })
                            : h("span", { class: "file-thumb" }, [FileIcon(18)]),
                        h("span", { class: "file-meta" }, [
                            h("span", { class: "file-name" }, [file.name]),
                            h("span", { class: "file-size" }, [formatSize(file.size)]),
                        ]),
                    ]
                ),
                onRemove
                    ? h(
                          "button",
                          {
                              type: "button",
                              class: "file-remove",
                              "aria-label": `Remove ${file.name}`,
                              onClick: () => onRemove(file.id),
                          },
                          [CloseIcon(12)]
                      )
                    : null,
            ])
        )
    );
}
