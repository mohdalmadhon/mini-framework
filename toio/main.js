import { build, Router } from "../src/index.js";
import { ToioApp } from "./app.js";
import { NotFoundPage } from "./pages.js";

const router = new Router({
    "/": ToioApp,
    "/404": NotFoundPage,
});

build(() => router.view(), "#app");
