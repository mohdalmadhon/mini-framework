import { ref, subscribe, on } from "../../src/index.js";
import { todos } from "./todos.js";

const SLEEP_AFTER = 30000;

const LINES = {
    add: ["New todo! You got this.", "Ooh, another one!", "Added. Let's go!", "On the list, boss."],
    done: ["Nice one!", "Purrfect!", "Done and dusted.", "Look at you go!", "One less thing!"],
    undo: ["Back on the list.", "Changed your mind?", "No worries."],
    remove: ["Bye bye, todo.", "Gone!", "Poof!"],
    clear: ["So clean!", "Fresh start!", "Tidy list, happy cat."],
    allDone: ["ALL DONE! You're amazing!", "Everything done! Nap time?", "100%! Treats for everyone!"],
    pet: ["Purrr...", "Meow!", "Hehe, that tickles.", "Keep going, I believe in you!", "Pet me again!"],
    wake: ["Huh? I'm awake!", "Oh hi again!", "*yawn* Back to work?"],
};

const FACES = { add: "happy", done: "happy", undo: "idle", remove: "sad", clear: "happy", allDone: "wow", pet: "happy", wake: "wow" };

export const mood = ref("cat:mood", { face: "idle", text: null, id: 0 });

let faceTimer = 0;
let textTimer = 0;
let sleepTimer = 0;

const pick = (list) => list[Math.floor(Math.random() * list.length)];

function snooze() {
    clearTimeout(sleepTimer);
    sleepTimer = setTimeout(() => {
        clearTimeout(faceTimer);
        clearTimeout(textTimer);
        mood.value = { face: "sleep", text: null, id: Date.now() };
    }, SLEEP_AFTER);
}

export function react(kind) {
    clearTimeout(faceTimer);
    clearTimeout(textTimer);
    mood.value = { face: FACES[kind], text: pick(LINES[kind]), id: Date.now() };
    faceTimer = setTimeout(() => (mood.value = { ...mood.value, face: "idle" }), 1800);
    textTimer = setTimeout(() => (mood.value = { ...mood.value, text: null }), 3000);
    snooze();
}

function wakeUp() {
    if (mood.value.face === "sleep") react("wake");
    else snooze();
}

on("pointermove", wakeUp);
on("keydown", wakeUp);
snooze();

const summary = (list) => ({ total: list.length, done: list.filter((todo) => todo.completed).length });

function changeOf(before, after) {
    if (after.total > before.total) return "add";
    if (after.total < before.total) {
        const removed = before.total - after.total;
        return before.done - after.done === removed && removed > 1 ? "clear" : "remove";
    }
    if (after.done > before.done) return after.done === after.total ? "allDone" : "done";
    if (after.done < before.done) return "undo";
    return null;
}

let last = summary(todos.value);

subscribe((key, value) => {
    if (key !== "todos") return;
    const now = summary(value);
    const kind = changeOf(last, now);
    last = now;
    if (kind) react(kind);
});
