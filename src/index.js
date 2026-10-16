/**
 * everything the framework gives you, import it from here.
 * @module mini-framework
 */
export { createElemant, h } from "./renderer/create_elemant.js";
export { VElement } from "./utils/elemant.js";
export { build, mount, rerender } from "./renderer/mount.js";
export { ref, Ref } from "./state/ref.js";
export { getState, setState, subscribe } from "./state/state.js";
export { Router } from "./router/router.js";
export { router, getRouter } from "./router/global.js";
export { on, off } from "./utils/events.js";
