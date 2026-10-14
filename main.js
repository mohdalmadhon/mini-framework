import { createElemant } from "./src/renderer/create_elemant.js";
import { build } from "./src/renderer/mount.js";

export function App() {
    return createElemant(
        "div",
        {
            id: "app",
            style: "font-family: sans-serif",
        },
        [
            createElemant("h1", {click: () => {console.log('working')}}, ["Hello World!"]),
        ]
    )
}

build(App)