import { ref } from "../../src/index.js";

export const viewer = ref("viewer", null);

export const openViewer = (file) => (viewer.value = file);

export const closeViewer = () => (viewer.value = null);
