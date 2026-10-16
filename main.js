import { build, Router } from "./src/index.js";
import { TodoApp, NotFound } from "./todomvc/app.js";

const router = new Router({
    "/": TodoApp,
    "/active": TodoApp,
    "/completed": TodoApp,
    "/404": NotFound,
});

build(() => router.view(), "#app");
