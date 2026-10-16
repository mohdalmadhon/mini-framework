import { createElemant as h } from "../../src/index.js";

export function TaskPagination({ currentPage, pageCount, onPageChange }) {
    const first = Math.max(1, Math.min(currentPage - 2, pageCount - 4));
    const last = Math.min(pageCount, first + 4);
    const numbers = [];
    for (let n = first; n <= last; n++) numbers.push(n);

    return h("nav", { class: "pager", "aria-label": "Pages" }, [
        h("button", { type: "button", class: "btn", disabled: currentPage === 1, onClick: () => onPageChange(currentPage - 1) }, [
            "Prev",
        ]),
        ...numbers.map((n) =>
            h(
                "button",
                {
                    key: n,
                    type: "button",
                    class: n === currentPage ? "btn page current" : "btn page",
                    "aria-label": `Page ${n}`,
                    "aria-current": n === currentPage ? "page" : null,
                    onClick: () => onPageChange(n),
                },
                [String(n)]
            )
        ),
        h(
            "button",
            {
                type: "button",
                class: "btn",
                disabled: currentPage === pageCount,
                onClick: () => onPageChange(currentPage + 1),
            },
            ["Next"]
        ),
    ]);
}
