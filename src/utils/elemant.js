/** The virtual DOM node class and its validation helpers. */
import { isEventAttr } from "./events.js";

/** Anything that can be passed as a child. */

/** Attribute map of a virtual element. */

/** Represents a virtual DOM element. */
export class VElement {
    /** The tag name. */
    tagsName;

    /** The attributes of the element. */
    attrs;

    /** The children, already flattened and cleaned. */
    children;

    /**
     * Creates a virtual DOM element.
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

    /** The `key` attribute, if any. */
    get key() {
        return this.attrs.key;
    }

    /**
     * Plain-object representation: `{ tag, attrs, children }`.
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
 * @param {VChildInput} children - Single child, or (nested) array of children.
 * @returns {Array<VElement|string>} Only virtual elements and strings.
 * @throws {TypeError} If a child is not a supported type.
 */
export function normalizeChildren(children) {
    /** @type {Array<VElement|string>} */
    const out = [];

    /**
     * Visits one child (recursively for arrays) and pushes it to `out`.
     * @param {*} item - A child, or a (nested) array of children.
     * @returns {void}
     * @throws {TypeError} If `item` is not a supported type.
     */
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
 * Checks that a tag name is a non-empty string.
 * @param {*} tagName - Value to check.
 * @returns {void}
 * @throws {TypeError} If it is not a non-empty string.
 */
function assertTagName(tagName) {
    if (typeof tagName !== "string" || tagName.trim().length === 0) {
        throw new TypeError(`Invalid tag name: ${String(tagName)}`);
    }
}

/**
 * Checks an attribute map: it must be an object, names must not be empty, functions are allowed only for events and `ref`, and values must be strings, booleans, finite numbers or (for `style`) an object.
 * @param {string} tag - Used in error messages.
 * @param {*} attrs - Value to check.
 * @returns {void}
 * @throws {TypeError} If the map or one of its values is invalid.
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
