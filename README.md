# mini-framework

a small js framework made from zero. no react, no angular, no vue.

## features

| feature | what it does |
|---|---|
| **dom** | you write the page as js objects (virtual dom). the framework makes the real dom and only updates what changed. |
| **state** | one global state for the whole app. change it and the page updates. |
| **routing** | the url hash (`#/about`) and the state are always the same. |
| **events** | its own event system (no `addEventListener`), for elements and for global things like keys and scroll. |

there is a **todoMVC** made with it in `todo/`.

## run it

```bash
cd todo_list
npx serve .        # or: python3 -m http.server 8080
```

then open the link it gives you.

```
todo_list/
├── index.html      # the page
├── main.js         # starts the app and the router
├── src/            # the framework
│   ├── renderer/   # create_elemant, render, diffing, mount, attrs
│   ├── state/      # global state + ref
│   ├── router/     # hash router
│   └── utils/      # VElement, events
└── todo/           # the todoMVC
    ├── config/     # limits, colors, filters
    ├── state/      # the data and what changes it
    ├── components/ # what you see on the page
    ├── icons/      # svg icons
    ├── utils/      # small helpers
    ├── decor/      # cat, confetti
    ├── pages/      # 404
    └── styles/     # css
```

## how it works

you don't call the framework, it calls you. you give it a function that says how the page looks, and it decides when to run it again.

```
 state changes ──► your component runs again ──► new virtual tree
        ▲                                               │
        │                                     compare with the old one
   event handler ◄── real dom ◄── only the changes ◄────┘
```

1. a **component** is a function that returns virtual elements. it never touches the real dom.
2. `build(component)` shows it one time and then listens to the state.
3. when the state changes it runs the component again, compares the new tree with the old one, and changes only what is different. so focus and scroll stay the same.
4. events change the state, and it starts again.

## start

```js
import { createElemant, build } from "./src/index.js";

build(() => createElemant("h1", {}, ["hello world"]), "#app");
```

`index.html` only needs `<div id="app"></div>` and a `<script type="module">`.

## create an element

```js
createElemant(tag, attrs, children)
```

```js
createElemant("p", { id: "intro", class: "big" }, ["some text"]);
// <p id="intro" class="big">some text</p>
```

it gives back a plain object:

```json
{ "tag": "p", "attrs": { "id": "intro", "class": "big" }, "children": ["some text"] }
```

`h` is a short name for it, and you can skip the attrs: `h("p", "hello")`.

## nest elements

children are an array. text and numbers become text, `null` and `false` are skipped (good for if), and arrays inside are opened (good for `.map`).

```js
h("div", { class: "card" }, [
    h("h2", {}, ["shopping list"]),
    h("ul", {}, items.map((item) => h("li", { key: item.id }, [item.name]))),
    items.length === 0 ? h("p", {}, ["nothing to buy"]) : null,
]);
```

## add attributes

put them in the attrs object with the normal html names.

```js
h("input", { type: "text", id: "name", class: "field", placeholder: "your name" });
```

- `true` adds an empty attribute, `false` / `null` removes it.
- `style` can be text or an object: `style: { backgroundColor: "red" }`.
- `value`, `checked`, `selected` always follow the state.
- svg works too: `h("svg", { viewBox: "0 0 24 24" }, [h("path", { d: "M5 12h14" })])`.
- `key` is for lists, so the framework knows which item is which.
- `ref: (el) => ...` gives you the real element after render (like to focus it).

wrong things (bad tag, a function as a normal attribute...) throw a `TypeError` with a clear message.

## create an event

add `on` + the event name with a function. it gets the normal event.

```js
h("button", { onClick: () => alert("clicked") }, ["click me"]);

h("input", {
    onInput: (e) => console.log(e.target.value),
    onKeyDown: (e) => { if (e.key === "Enter") console.log("enter!"); },
});
```

any event works: `onClick`, `onDblClick`, `onInput`, `onChange`, `onKeyDown`, `onBlur`, `onDrop`...

for global events (keys, scroll, resize) use `on`:

```js
import { on } from "./src/index.js";

const stop = on("keydown", (e) => { if (e.ctrlKey && e.key === "s") save(); });
stop(); // stop listening
```

no `addEventListener`: the handlers are saved in the framework, and each element gets one small function on its `on<type>` property that calls them. when the page updates it only swaps the handler.

## state

```js
import { ref } from "./src/index.js";

function Counter() {
    const count = ref("counter", 0);
    return h("button", { onClick: () => count.value++ }, [`clicked ${count.value} times`]);
}
```

- `ref(key, first)` gives you one piece of the global state. the first value is used only one time.
- read `count.value`, set `count.value = x` and the page updates. `count.update((n) => n + 1)` works too.
- same key = same value everywhere.
- many changes in one go = one render.
- make a new array / object, don't change the old one: `todos.value = [...todos.value, newTodo]`.

## routing

```js
import { Router, build } from "./src/index.js";

const router = new Router({
    "/": Home,
    "/user/:id": ({ params }) => h("h1", {}, [`user ${params.id}`]),
    "/404": NotFound,
});

build(() => router.view(), "#app");
```

- links are normal: `h("a", { href: "#/about" }, ["about"])`.
- `router.navigate("/about")` to go from code.
- the path is in the state, so back / forward work.
- every page gets `{ path, params, router }`.

## good to know

- a component can run after every change, so keep it fast.
- don't change the dom inside `#app` by hand.
- hash routing only (`#/path`).

## the todoMVC

same html, classes and ids as the [official example](https://todomvc.com/examples/javascript-es6/dist/): `todoapp`, `new-todo`, `toggle-all`, `todo-list`, `toggle`, `destroy`, `edit`, `footer`, `todo-count`, `filters`, `clear-completed`, `info`.

- type and press enter to add. the list and the footer show up after the first todo.
- check / uncheck one, or all with toggle-all.
- `×` to remove. **clear completed** removes only the checked ones.
- the counter shows how many are left.
- all / active / completed are routes (`#/`, `#/active`, `#/completed`), so the url changes.
- double click to edit. enter saves, escape cancels, empty removes it.
- everything is saved in `localStorage`.

### extras

- **add details**: description, color, icon and files for a new todo.
- the `⋯` button opens a box to change all of it later.
- 14 svg icons made by hand.
- files: photos open big, other files download. photos get smaller before saving.
- undo after removing.
- progress bar, rainbow at 100% and confetti.
- drag todos to change the order.
- **the cat**: drag it, click it to pet it. it reacts when you add, finish or remove todos, its eyes follow the mouse, and it sleeps if you do nothing.

### limits

| what | limit |
|---|---|
| title | 60 characters |
| description | 200 characters |
| files | 5 per todo |
| file size | 1 MB |

all limits are in `todo/config/constants.js`.
