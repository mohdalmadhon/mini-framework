/**
 * Entry point of the TOIO app. Open index.html through a local web server
 * (see README.md).
 *
 * Routes: "#/" is the todo app; any other path shows the error page.
 */
import { build, Router } from "./src/index.js";
import { ToioApp } from "./toio/app.js";
import { ErrorPage, NotFoundPage } from "./toio/pages.js";

const router = new Router({
    "/": ToioApp,
    "/404": NotFoundPage,
});

/** Shows the current route; if the app throws, shows the error page instead. */
function Root() {
    try {
        return router.view();
    } catch (error) {
        console.error(error);
        return ErrorPage({
            code: "Oops",
            title: "Something went wrong",
            message: error instanceof Error ? error.message : "An unexpected error happened.",
            crash: true,
        });
    }
}

build(Root, "#app");
