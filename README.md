# mini-framework

A small JavaScript framework written from scratch (no React, Angular, Vue or similar). It gives you:

| Feature | What it does |
|---|---|
| **DOM abstraction** | You describe the page as JavaScript objects (a *virtual DOM*); the framework builds the real DOM and later updates only what changed. |
| **State management** | One global store reachable from every page and component. Changing it re-renders the app. |
| **Routing** | The URL hash (`#/about`) is kept in sync with the state. |
| **Event handling** | Its own event system (not `addEventListener`) for elements and for global events such as keybindings and scrolling. |

A **TodoMVC** built with the framework is included (it runs from the root).

## Run it

Browsers block ES modules on `file://`, so serve the folder from its root:

```bash
cd todo_list
npx serve .            # or: python3 -m http.server 8080
```

Open the printed address (for example `http://localhost:3000`): the TodoMVC runs from the root.

```
todo_list/
├── index.html          # the app page (runs from the root)
├── 404.html            # shown by `npx serve` for a real URL that does not exist
├── main.js             # starts the app + router (#/, #/active, #/completed; anything else = 404 page)
├── todomvc/            # the TodoMVC
│   ├── app.js          # assembles the page from the components
│   ├── constants.js    # storage key, keys, filters
│   ├── storage.js      # localStorage load/save
│   ├── store.js        # global state (todos, editing, draft) and the actions on it
│   ├── components/     # Header, Main, TodoItem, Footer, Info, NotFound
│   └── todomvc.css
├── toio/               # a second demo app, served at /toio/ (index.html, main.js, app.js, ...)
└── src/                # the framework
    ├── index.js        # public API (import everything from here)
    ├── renderer/       # create_elemant, render, diffing, mount, attrs
    ├── state/          # global store + ref
    ├── router/         # hash router
    └── utils/          # VElement class, event system
```

## Why it works this way (the big idea)

With a *library* you call it. With a *framework* the control is **inverted**: you hand the framework a function that says *what the page looks like*, and the framework decides *when* to call it again.

```
 state changes ──► framework calls your component ──► new virtual tree
        ▲                                                   │
        │                                          diff with the old tree
   event handler ◄── real DOM ◄── only differences applied ◄┘
```

1. A **component** is a function returning virtual elements. It never touches the real DOM.
2. **`build(component)`** renders it once, then subscribes to the state.
3. When state changes, the framework calls your component again, **compares** the new tree with the previous one and patches only the differences. So focus, caret position and scrolling survive updates.
4. Event handlers change the state. That closes the loop.

## Quick start

```js
import { createElemant, build } from "./src/index.js";

build(() => createElemant("h1", {}, ["Hello world"]), "#app");
```

`index.html` only needs `<div id="app"></div>` and a `<script type="module">`.

## Create an element

```js
createElemant(tag, attrs, children)
```

```js
createElemant("p", { id: "intro", class: "big" }, ["Some text"]);
// <p id="intro" class="big">Some text</p>
```

`createElemant` returns a plain object (a `VElement`), shaped like the model in the subject:

```json
{ "tag": "p", "attrs": { "id": "intro", "class": "big" }, "children": ["Some text"] }
```

Shortcuts: `h` is an alias of `createElemant`, and `attrs` may be skipped:
`h("p", "Hello")` or `h("ul", [h("li", "one"), h("li", "two")])`.

*Why:* an element is just data, so the framework can compare two versions of it cheaply.

## Nest elements

Children are an array. Strings become text, numbers become text, `null`/`false` are ignored (handy for conditions), and nested arrays are flattened (handy for `.map`).

```js
h("div", { class: "card" }, [
    h("h2", {}, ["Shopping list"]),
    h("ul", {}, items.map((item) => h("li", { key: item.id }, [item.name]))),
    items.length === 0 ? h("p", {}, ["Nothing to buy"]) : null,
]);
```

## Add attributes

Put them in the `attrs` object. Attribute names are the HTML ones (`class`, `for`, `id`, `data-*`, `href`, `placeholder`...).

```js
h("input", { type: "text", id: "name", class: "field", placeholder: "Your name", disabled: false });
```

- `true` renders an empty attribute (`disabled: true` gives `disabled=""`); `false`, `null` and `undefined` remove it.
- `style` can be a string or an object: `style: { backgroundColor: "red" }`.
- `value`, `checked`, `selected` are set as live properties, so inputs always show what your state says.
- **SVG works too**: `svg` and everything inside it is created as real SVG (`h("svg", { viewBox: "0 0 24 24" }, [h("path", { d: "M5 12h14" })])`).
- `key` is not rendered. Give list items a unique `key` so the framework can match them between renders.
- `ref: (el) => ...` is called with the real element after each render (e.g. to focus it).

*Why validation:* invalid input (wrong tag, function used as a normal attribute, unsupported child) throws a `TypeError` with a clear message instead of failing silently.

## Create an event

Add an `on` + event name attribute with a function. The function receives the native event.

```js
h("button", { onClick: () => alert("clicked") }, ["Click me"]);

h("input", {
    onInput: (e) => console.log(e.target.value),
    onKeyDown: (e) => { if (e.key === "Enter") console.log("enter!"); },
});
```

Any standard event works: `onClick`, `onDblClick`, `onInput`, `onChange`, `onKeyDown`, `onKeyUp`, `onFocus`, `onBlur`, `onSubmit`, `onMouseOver`, `onScroll`, `onDrop`...

**Global events** (keybindings, scrolling, resizing) use `on(type, handler, target = window)`:

```js
import { on, off } from "./src/index.js";

const stop = on("keydown", (e) => { if (e.ctrlKey && e.key === "s") save(); });
on("scroll", () => console.log(window.scrollY));
stop();                      // remove it later (or off("keydown", handler))
```

*Why it is not `addEventListener`:* handlers are stored in the framework's own registry, and one small dispatcher per element and event type is installed through the DOM `on<type>` property. Re-rendering only replaces a registry entry; nothing has to be unbound and rebound, and you never call `addEventListener` yourself.

## State management

```js
import { ref } from "./src/index.js";

function Counter() {
    const count = ref("counter", 0);        // key, initial value
    return h("button", { onClick: () => count.value++ }, [`Clicked ${count.value} times`]);
}
```

- `ref(key, initial)` returns a handle on one key of the **global** store. The initial value is used only the first time, so calling `ref` on every render is fine.
- `count.value` reads; `count.value = x` writes and **re-renders automatically**. `count.update((n) => n + 1)` is the same.
- Every page/component using the same key shares the same value.
- Several changes in the same tick are batched into one render.
- Store a **new** array/object instead of mutating the old one: `todos.value = [...todos.value, newTodo]`.
- Without refs: `getState(key)`, `setState(key, value)`, `subscribe(fn)`.

## Routing

```js
import { Router, build } from "./src/index.js";

const router = new Router({
    "/": Home,
    "/user/:id": ({ params }) => h("h1", {}, [`User ${params.id}`]),
    "/404": NotFound,                 // used for unknown paths
});

build(() => router.view(), "#app");
```

- Links are plain hash links: `h("a", { href: "#/about" }, ["About"])`.
- `router.navigate("/about")` changes the URL from code.
- `router.path` is the current path. It lives in the global state, so URL and state always agree; back/forward buttons work too.
- Each route component receives `{ path, params, router }`.

## Complete example

```js
import { createElemant as h, ref, Router, build, on } from "./src/index.js";

const Home = () => {
    const count = ref("counter", 0);
    return h("div", {}, [
        h("h1", {}, ["Counter"]),
        h("p", {}, [`Count: ${count.value}`]),
        h("button", { onClick: () => count.update((n) => n + 1) }, ["+1"]),
        h("a", { href: "#/about" }, ["About"]),
    ]);
};

const router = new Router({ "/": Home, "/about": () => h("h1", {}, ["About"]) });
on("keydown", (e) => { if (e.key === "r") ref("counter", 0).value = 0; });
build(() => router.view(), "#app");
```

## API summary

| Function | Purpose |
|---|---|
| `createElemant(tag, attrs, children)` / `h` | Create a virtual element |
| `build(component, target = "#app")` | Mount the app and keep it updated |
| `rerender()` | Force a render now (rarely needed) |
| `mount(vnodes, container)` | Low-level one-time render |
| `ref(key, initial)` → `Ref` (`.value`, `.update(fn)`) | Global reactive state |
| `getState` / `setState` / `subscribe` | Store without refs |
| `new Router(routes)` → `.view()`, `.navigate(path)`, `.path` | Routing |
| `on(type, handler, target)` / `off(...)` | Global events |

All functions are documented with JSDoc in `src/`.

## Limits worth knowing

- A component must be fast and free of side effects: it can be called after every state change.
- Don't change the framework's DOM by hand (e.g. `appendChild` inside `#app`); the diff assumes it owns it.
- Only events that have an `on<type>` property are supported (all common ones).
- Hash routing only (`#/path`). The TodoMVC uses three routes (`#/`, `#/active`, `#/completed`) plus the 404 page for any unknown path.

## The TodoMVC app

`index.html` runs the TodoMVC. The code is split by role inside `todomvc/` (see the tree above) and uses every part of the framework. It has the same markup and class names as the official examples (`todoapp`, `new-todo`, `toggle-all`, `todo-list`, `toggle`, `destroy`, `edit`, `footer`, `todo-count`, `filters`, `clear-completed`, `info`).

- **Add** a todo: type in `.new-todo` and press Enter. The `main` section and the `footer` only appear once there is at least one todo.
- **Check/uncheck** one todo with its checkbox, or all of them with `toggle-all`.
- **Remove** a todo with the `×` button (shown on hover) and **Clear completed** removes only the checked ones (the button only appears if one is checked).
- **Counter**: `.todo-count` shows the number of unchecked todos (`1 item left` / `N items left`).
- **Filters**: All / Active / Completed are routes (`#/`, `#/active`, `#/completed`), so the URL changes. The selected link gets the class `selected`.
- **Edit**: double-click a todo (`onDblClick`) to edit it. Enter or leaving the field saves, Escape cancels, and an empty text removes the todo.
- The todos are saved in `localStorage` with `subscribe` and restored on load.

The framework features used: `createElemant` (every element), `ref` (`todos`, `editing`, `draft` are global state), `Router` (the three filter routes) and the `onKeyDown` / `onChange` / `onClick` / `onDblClick` / `onBlur` event attributes.
