import { createElemant } from "./src/renderer/create_elemant.js";
import { build } from "./src/renderer/mount.js";
import { ref } from "./src/state/state.js";

export function App() {
    const count = ref("counter", 0);

    const clickHandler = () => {
        count.valueOf++;
        build(App);
    };

    return createElemant(
        "div",
        {
            id: "app",
            style: "display: flex; flex-direction: column; gap: 15px; font-family: sans-serif",
        },
        [
            createElemant("h1", {}, ["My Counter"]),
            createElemant(
                "button",
                {
                    type: "button",
                    click: clickHandler,
                },
                [count.valueOf.toString()]
            ),
        ]
    );
}

build(App);