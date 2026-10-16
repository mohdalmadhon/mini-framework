import { ref } from "../../src/index.js";
import { moveTodo } from "./todos.js";

export const dragging = ref("reorder:dragging", null);
export const dropTarget = ref("reorder:target", null);

export function startDrag(event, id) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
    dragging.value = id;
}

export function dragOverTodo(event, id) {
    if (!dragging.value) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (dropTarget.value !== id) dropTarget.value = id;
}

export function endDrag() {
    dragging.value = null;
    dropTarget.value = null;
}

export function dropOnTodo(event, id) {
    if (!dragging.value) return;
    event.preventDefault();
    moveTodo(dragging.value, id);
    endDrag();
}
