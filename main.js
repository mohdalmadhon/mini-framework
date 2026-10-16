/**
 * Entry point of the TOIO app. Open index.html through a local web server
 * (see README.md).
 */
import { build } from "./src/index.js";
import { ToioApp } from "./toio/app.js";

build(ToioApp, "#app");
