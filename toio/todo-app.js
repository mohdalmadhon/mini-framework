import { createElemant as h } from "../src/index.js";
import {
    addTodo,
    cancelEdit,
    clearCompleted,
    editingId,
    editingTitle,
    newTodo,
    removeTodo,
    saveEdit,
    startEdit,
    toggleAll,
    toggleTodo,
    todos,
    updateEdit,
} from "./todo-store.js";
import { Footer } from "./components/todo/Footer.js";
import { Header } from "./components/todo/Header.js";
import { Info } from "./components/todo/Info.js";
import { Main } from "./components/todo/Main.js";

export function ToioTodoApp({ path }) {
    const list = todos.value;
    const activeCount = list.filter((todo) => !todo.completed).length;
    const completedCount = list.length - activeCount;

    return h("section", { class: "todoapp toio-todoapp" }, [
        Header({
            value: newTodo.value,
            onInput: (value) => (newTodo.value = value),
            onAdd: () => addTodo(newTodo.value),
        }),
        list.length > 0
            ? Main({
                  todos: list.filter((todo) => {
                      if (path === "/active") return !todo.completed;
                      if (path === "/completed") return todo.completed;
                      return true;
                  }),
                  allCompleted: completedCount === list.length,
                  editingId: editingId.value,
                  editingTitle: editingTitle.value,
                  onToggle: toggleTodo,
                  onRemove: removeTodo,
                  onToggleAll: toggleAll,
                  onStartEdit: startEdit,
                  onUpdateEdit: updateEdit,
                  onSaveEdit: saveEdit,
                  onCancelEdit: cancelEdit,
              })
            : null,
        list.length > 0
            ? Footer({ activeCount, completedCount, path, onClearCompleted: clearCompleted })
            : null,
        Info(),
    ]);
}

export function NotFound() {
    return h("section", { class: "todoapp toio-todoapp" }, [
        h("header", { class: "header" }, [h("h1", {}, ["toio"])]),
        h("p", { class: "not-found" }, ["Page not found. ", h("a", { href: "#/" }, ["Back to toio"])]),
    ]);
}
