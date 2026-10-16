import { isEventAttr } from "./events.js";

/**
 * a virtual element. it is just data that says what the real element should look like.
 */
export class VElement {
    /** the tag name. */
    tagsName;

    /** the attributes. */
    attrs;

    /** the children, already flat and clean. */
    children;

    /**
     * make a virtual element and check it.
     * @param {string} tagsName - the tag name like "div".
     * @param {object} [attrs={}] - the attributes.
     * @param {Array|string|VElement} [children=[]] - what goes inside.
     * @throws {TypeError} when the tag, an attribute or a child is not valid.
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
     * the key of the element, used to match list items between renders.
     * @returns {string|number|undefined}
     */
    get key() {
        return this.attrs.key;
    }

    /**
     * the element as a plain object { tag, attrs, children }.
     * @returns {{tag: string, attrs: object, children: Array}}
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
 * make the children flat and clean.
 * numbers become text, null and true/false are dropped, arrays are opened.
 * @param {*} children - one child or a list (can be nested).
 * @returns {Array<VElement|string>} only elements and text.
 * @throws {TypeError} when a child is not supported.
 */
export function normalizeChildren(children) {
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
 * check that the tag name is a string that is not empty.
 * @param {*} tagName - the value to check.
 * @returns {void}
 * @throws {TypeError} when it is not valid.
 */
function assertTagName(tagName) {
    if (typeof tagName !== "string" || tagName.trim().length === 0) {
        throw new TypeError(`Invalid tag name: ${String(tagName)}`);
    }
}

/**
 * check the attributes.
 * functions are only for events (onClick...) and ref.
 * values must be text, true/false, a number, or an object for style.
 * @param {string} tag - the tag name, for the error message.
 * @param {*} attrs - the attributes to check.
 * @returns {void}
 * @throws {TypeError} when one of them is not valid.
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
