import {renderElemant} from '../renderer/render.js'

export function mount(node, target) {
    target.replaceWith(node);
    return node;
}

export function build(entery) {
    const app = renderElemant(entery());
    const div = document.getElementById("app");
    if(!div) {
        throw new Error("could not mount app");
    }

    mount(app, div);
}