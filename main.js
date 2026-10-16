import { build, Router } from "./src/index.js";
import { ToioApp } from "./toio/app.js";
import { NotFoundPage } from "./toio/pages.js";

const router = new Router({
    "/": ToioApp,
    "/404": NotFoundPage,
});

build(() => router.view(), "#app");
