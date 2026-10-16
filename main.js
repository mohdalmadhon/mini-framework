import { build, Router } from "./src/index.js";
import { TodoApp, NotFoundPage } from "./todo/app.js";

const router = new Router({
    "/": TodoApp,
    "/active": TodoApp,
    "/completed": TodoApp,
    "/404": NotFoundPage,
});

build(() => router.view(), "#app");
