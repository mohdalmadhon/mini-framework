# mini-framework

A small JavaScript framework written from scratch (no React, Angular, Vue or similar). It gives you:

| Feature | What it does |
|---|---|
| **DOM abstraction** | You describe the page as JavaScript objects (a *virtual DOM*); the framework builds the real DOM and later updates only what changed. |
| **State management** | One global store reachable from every page and component. Changing it re-renders the app. |
| **Routing** | The URL hash (`#/about`) is kept in sync with the state. |
| **Event handling** | Its own event system (not `addEventListener`) for elements and for global events such as keybindings and scrolling. |

A **TodoMVC** built with the framework is included in `todo/` (it runs from the root). It has the same markup, classes, ids and routes as the official TodoMVC examples, with its own look.

## Run it

Browsers block ES modules on `file://`, so serve the folder from its root:

```bash
cd todo_list
npx serve .            # or: python3 -m http.server 8080
```

Open the printed address (for example `http://localhost:3000`): the TodoMVC runs from the root.

```
todo_list/
├── index.html              # the app page (runs from the root)
├── 404.html                # shown by `npx serve` for a real URL that does not exist
├── main.js                 # starts the app + router (#/, #/active, #/completed; anything else = 404 page)
├── todo/                   # the TodoMVC app
│   ├── app.js              # assembles the page from the components
│   ├── config/
│   │   └── constants.js    # keys, LIMITS, colors, filters (every limit lives here)
│   ├── state/              # global state + the actions that change it (no DOM code)
│   │   ├── todos.js        # the list: add, update, toggle, remove, clear completed, undo
│   │   ├── storage.js      # localStorage load/save, checks every saved value
│   │   ├── composer.js     # the "new todo" form (title, description, color, icon, files)
│   │   ├── editing.js      # inline title editing (double-click)
│   │   ├── dialog.js       # the details dialog (edit everything of a todo)
│   │   ├── attachments.js  # adding files, with the count / size / storage limits
│   │   ├── viewer.js       # photo viewer
│   │   ├── notice.js       # toast messages + Undo
│   │   └── shortcuts.js    # Escape closes the viewer / dialog
│   ├── components/         # functions returning virtual elements (no state logic)
│   │   ├── Header.js  Composer.js  Main.js  TodoItem.js  Footer.js  Info.js
│   │   ├── TaskDialog.js  Lightbox.js  Toast.js
│   │   └── fields/         # reusable form parts: TextField, CharCount, ColorPicker, IconPicker, FileDrop, FileList
│   ├── icons/
│   │   ├── task-icons.js   # the 14 hand-made SVG icons a todo can have
│   │   └── ui-icons.js     # small button icons + 404 drawing
│   ├── utils/              # pure helpers: text.js, color.js, files.js
│   ├── decor/              # Confetti.js, Cat.js
│   ├── pages/NotFound.js   # 404 page
│   ├── styles/             # base.css, todomvc.css, details.css, overlays.css, decor.css
│   └── assets/logo.svg
└── src/                    # the framework
    ├── index.js            # public API (import everything from here)
    ├── renderer/           # create_elemant, render, diffing, mount, attrs
    ├── state/              # global store + ref
    ├── router/             # hash router
    └── utils/              # VElement class, event system
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
- Hash routing only (`#/path`). The app uses three routes (`#/`, `#/active`, `#/completed`) plus the 404 page for any unknown path.

## The TodoMVC app

`index.html` runs the app. The code is split by role inside `todo/` (see the tree above) and uses every part of the framework. The DOM is the same as the official [JavaScript ES6 example](https://todomvc.com/examples/javascript-es6/dist/):

```html
<section class="todoapp">
  <header class="header"><h1>todos</h1><input class="new-todo" placeholder="What needs to be done?" autofocus></header>
  <main class="main">
    <div class="toggle-all-container">
      <input id="toggle-all" class="toggle-all" type="checkbox">
      <label class="toggle-all-label" for="toggle-all">Mark all as complete</label>
    </div>
    <ul class="todo-list">
      <li data-id="..." class="completed|editing">
        <div class="view"><input class="toggle" type="checkbox"><label>Title</label><button class="destroy"></button></div>
        <input class="edit">            <!-- only while editing -->
      </li>
    </ul>
  </main>
  <footer class="footer">
    <span class="todo-count"><strong>2</strong> items left</span>
    <ul class="filters"><li><a href="#/" class="selected">All</a></li><li><a href="#/active">Active</a></li><li><a href="#/completed">Completed</a></li></ul>
    <button class="clear-completed">Clear completed</button>
  </footer>
</section>
<footer class="info">...</footer>
```

- **Add** a todo: type in `.new-todo` and press Enter (empty text is ignored). The `main` section and the `footer` only appear once there is at least one todo.
- **Check/uncheck** one todo with its checkbox, or all of them with `toggle-all`.
- **Remove** a todo with the `×` button (shown on hover). **Clear completed** removes only the checked ones (the button only appears if one is checked).
- **Counter**: `.todo-count` shows the number of unchecked todos (`1 item left` / `N items left`).
- **Filters**: All / Active / Completed are routes (`#/`, `#/active`, `#/completed`), so the URL changes. The selected link gets the class `selected`.
- **Edit**: double-click a todo (`onDblClick`) to edit it. Enter or leaving the field saves, Escape cancels, and an empty text removes the todo.
- The todos are saved in `localStorage` with `subscribe` and restored on load.

### Extras

The TodoMVC markup above is unchanged; the extras are added around it.

- **Details of a new todo**: under `.new-todo`, a title counter (`12/60`) and an **Add details** button open a panel with a description, a color, an icon and files. Pressing Enter in `.new-todo` (or **Add todo**) adds the todo with those details. Without details, it works exactly like any TodoMVC.
- **Description**: shown under the title on the card (3 lines max, full text in the dialog).
- **Color**: 6 preset swatches, or any color with the `+` picker. New todos get the next preset color by default. Text turns white on dark colors. The color is set as CSS variables on the `li` (`--todo-color`, `--todo-ink`), so no element is added.
- **Icons**: 14 hand-made SVG icons (`todo/icons/task-icons.js`): star, heart, home, work, shopping, study, fitness, travel, code, music, gift, plant, coffee, reminder.
- **Files**: add photos or documents with **Add files** or by drag and drop. Photos open in a viewer; other files download. Files use `div`s, not `li`s, so `.todo-list li` still matches only todos.
- **Details dialog**: the `⋯` button (or a click on the description) opens a dialog to change the title, description, color, icon and files. Save keeps the changes; Cancel, Escape or a click outside drops them.
- After a removal or Clear completed, a toast offers **Undo**. Confetti falls when every todo is done (it never blocks clicks). A draggable cat on wide screens (its position is saved).

### Limits

All limits are in `todo/config/constants.js` (`LIMITS`). They are checked in the inputs (`maxlength`, disabled buttons) **and** again in the state actions and when loading saved data, so they can't be bypassed.

| What | Limit |
|---|---|
| Title | 60 characters (counter turns to a warning at 90%) |
| Description | 200 characters |
| Files per todo | 5 |
| Size per file | 1 MB (photos are resized to 1280 px and re-encoded as JPEG first) |
| All saved data | about 4.5 MB (browsers give about 5 MB of localStorage) |

Files are read in parallel with `Promise.allSettled`, so one bad file does not block the others, and each problem is reported in the toast.

The framework features used: `createElemant` (every element), `ref` (`todos`, `composer`, `editing`, `draft`, `dialog`, `viewer`, `notice`... are global state), `Router` (the three filter routes + 404), the `onKeyDown` / `onInput` / `onChange` / `onClick` / `onDblClick` / `onBlur` / `onDrop` / `onDragOver` / `onPointer*` event attributes, and `on("keydown"/"resize")` for global events.
