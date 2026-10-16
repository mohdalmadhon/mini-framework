import { createElemant as h } from "../src/index.js";
import "./state/shortcuts.js";
import "./state/mood.js";
import { Header } from "./components/Header.js";
import { Composer } from "./components/Composer.js";
import { Progress } from "./components/Progress.js";
import { Main } from "./components/Main.js";
import { Footer } from "./components/Footer.js";
import { Info } from "./components/Info.js";
import { TaskDialog } from "./components/TaskDialog.js";
import { Lightbox } from "./components/Lightbox.js";
import { Toast } from "./components/Toast.js";
import { Confetti } from "./decor/Confetti.js";
import { Cat } from "./decor/Cat.js";

export { NotFoundPage } from "./pages/NotFound.js";

export function TodoApp(context) {
    return [
        h("section", { key: "todoapp", class: "todoapp" }, [Header(), Composer(), Progress(), Main(context), Footer(context)]),
        Info(),
        Cat(),
        TaskDialog(),
        Lightbox(),
        Toast(),
        Confetti(),
    ];
}
