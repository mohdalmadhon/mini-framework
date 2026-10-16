import { build, Router } from "./src/index.js";
import { ToioTodoApp, NotFound } from "./toio/todo-app.js";

const router = new Router({
    "/": ToioTodoApp,
    "/active": ToioTodoApp,
    "/completed": ToioTodoApp,
    "/404": NotFound,
});

build(() => router.view(), "#app");
