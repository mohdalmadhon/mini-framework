/**
 * @module utils/elemant
 *
 * The virtual DOM node class. A virtual node is a plain JavaScript object
 * describing an element: its tag, its attributes and its children.
 */
import { isEventAttr } from "./events.js";

/**
 * Anything that can be passed as a child. `null`, `undefined` and booleans
 * are ignored, numbers become text, arrays are flattened.
 *
 * @typedef {VElement|string|number|boolean|null|undefined|Array<any>} VChildInput
 */

/**
 * Attribute map of a virtual element.
 *
 * Special attributes:
 *  - `onClick`, `onInput`, `onKeyDown`... : event handlers (functions)
 *  - `key`   : stable identity used to match list items between renders
 *  - `ref`   : function called with the real DOM element after each render
 *  - `style` : string or object (`{ backgroundColor: "red" }`)
 *  - `value`, `checked`, `selected` : applied as live DOM properties
 *
 * @typedef {Object<string, string|number|boolean|Function|Object|null|undefined>} Attrs
 */

/**
 * Represents a virtual DOM element.
 *
 * Its JSON shape matches the one in the project subject:
 * `{ tag, attrs, children }` (see {@link VElement#toJSON}).
 *
 * @class
 */
export class VElement {
    /** @type {string} */
    tagsName;
    /** @type {Attrs} */
    attrs;
    /** @type {Array<VElement|string>} */
    children;

    /**
     * Creates a virtual DOM element.
     *
     * @param {string} tagsName - The HTML tag name (`"div"`, `"input"`...).
     * @param {Attrs} [attrs={}] - The element attributes.
     * @param {VChildInput} [children=[]] - The child elements.
     * @throws {TypeError} If the tag, an attribute or a child is invalid.
     */
    constructor(tagsName, attrs = {}, children = []) {
        assertTagName(tagsName);
        attrs = attrs ?? {};
        assertAttrs(tagsName, attrs);

        this.tagsName = tagsName;
        this.attrs = attrs;
        this.children = normalizeChildren(children);
    }

    /**
     * The `key` attribute, if any.
     *
     * @type {string|number|undefined}
     */
    get key() {
        return this.attrs.key;
    }

    /**
     * Plain-object representation: `{ tag, attrs, children }`.
     *
     * @returns {{tag: string, attrs: Attrs, children: Array<object|string>}}
     */
    toJSON() {
        return {
            tag: this.tagsName,
            attrs: this.attrs,
            children: this.children,
        };
    }
}

/**
 * Flattens and cleans a list of children.
 *
 * @param {VChildInput} children - Single child, or (nested) array of children.
 * @returns {Array<VElement|string>} Only virtual elements and strings.
 * @throws {TypeError} If a child is not a supported type.
 */
export function normalizeChildren(children) {
    /** @type {Array<VElement|string>} */
    const out = [];

    const walk = (item) => {
        if (item == null || typeof item === "boolean") return;

        if (Array.isArray(item)) {
            item.forEach(walk);
            return;
        }

        if (item instanceof VElement || typeof item === "string") {
            out.push(item);
            return;
        }

        if (typeof item === "number" && Number.isFinite(item)) {
            out.push(String(item));
            return;
        }

        throw new TypeError(`Invalid child: ${String(item)} (${typeof item})`);
    };

    walk(children);
    return out;
}

/**
 * @param {*} tagName
 * @throws {TypeError}
 */
function assertTagName(tagName) {
    if (typeof tagName !== "string" || tagName.trim().length === 0) {
        throw new TypeError(`Invalid tag name: ${String(tagName)}`);
    }
}

/**
 * @param {string} tag - Used in error messages.
 * @param {*} attrs
 * @throws {TypeError}
 */
function assertAttrs(tag, attrs) {
    if (typeof attrs !== "object" || Array.isArray(attrs)) {
        throw new TypeError(`<${tag}>: attrs must be an object`);
    }

    for (const [name, value] of Object.entries(attrs)) {
        if (name.trim().length === 0) {
            throw new TypeError(`<${tag}>: empty attribute name`);
        }

        if (value == null) continue;

        const type = typeof value;

        if (type === "function") {
            if (name === "ref" || isEventAttr(name)) continue;
            throw new TypeError(
                `<${tag}>: attribute "${name}" cannot be a function ` +
                    `(event handlers are named onClick, onInput, ...)`
            );
        }

        if (isEventAttr(name)) {
            throw new TypeError(`<${tag}>: "${name}" must be a function`);
        }

        if (name === "style" && type === "object" && !Array.isArray(value)) {
            continue;
        }

        if (type === "string" || type === "boolean") continue;
        if (type === "number" && Number.isFinite(value)) continue;

        throw new TypeError(
            `<${tag}>: invalid value for attribute "${name}" (${type})`
        );
    }
}
