import { componentStates } from "./state.js";

export class Ref {
    key;

    constructor(key) {
        this.key = key;
    }

    get valueOf() {
        return componentStates.get(this.key);
    }

    set valueOf(value) {
        componentStates.set(this.key, value);
    }

    value(value) {
        this.valueOf = value;
    }
}