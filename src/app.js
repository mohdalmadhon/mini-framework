import { createElem } from "./renderer/createElemant.js";

export function App() {
    return createElem(
        "div",
        {
            id: "app",
            style: "font-family: sans-serif",
        },
        [
            createElem("h1", {onClick: () => {console.log('working')}}, ["Hello World!"]),
        ]
    )
}