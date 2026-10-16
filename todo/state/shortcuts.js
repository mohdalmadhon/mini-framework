import { on } from "../../src/index.js";
import { ESCAPE_KEY } from "../config/constants.js";
import { viewer, closeViewer } from "./viewer.js";
import { dialog, closeDialog } from "./dialog.js";

on("keydown", (event) => {
    if (event.key !== ESCAPE_KEY) return;
    if (viewer.value) closeViewer();
    else if (dialog.value) closeDialog();
});
