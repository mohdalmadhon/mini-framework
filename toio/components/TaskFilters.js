import { createElemant as h } from "../../src/index.js";
import { CloseIcon, SearchIcon } from "../icons.js";

export function TaskFilters({ query, needle, filter, total, doneCount, filteredCount, onQueryChange, onFilterChange, onSearchRef }) {
    return h("section", { class: "controls" }, [
        h("div", { class: "search" }, [
            h("span", { class: "search-icon" }, [SearchIcon(18)]),
            h("input", {
                class: "search-input",
                type: "search",
                placeholder: "Search tasks (press /)",
                "aria-label": "Search tasks",
                value: query,
                onInput: (e) => onQueryChange(e.target.value),
                onKeyDown: (e) => {
                    if (e.key === "Escape") {
                        onQueryChange("");
                        e.target.blur();
                    }
                },
                ref: onSearchRef,
            }),
            query
                ? h("button", { type: "button", class: "search-clear", "aria-label": "Clear search", onClick: () => onQueryChange("") }, [
                      CloseIcon(14),
                  ])
                : null,
            needle ? h("span", { class: "found" }, [`${filteredCount} found`]) : null,
        ]),
        h(
            "div",
            { class: "tabs", role: "group", "aria-label": "Filter tasks" },
            [
                ["all", "All", total],
                ["active", "Active", total - doneCount],
                ["done", "Done", doneCount],
            ].map(([key, label, count]) =>
                h(
                    "button",
                    {
                        key,
                        type: "button",
                        class: filter === key ? "tab current" : "tab",
                        "aria-pressed": String(filter === key),
                        onClick: () => onFilterChange(key),
                    },
                    [label, h("span", { class: "count" }, [String(count)])]
                )
            )
        ),
    ]);
}
