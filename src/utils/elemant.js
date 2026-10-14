import { isTypeEventListener } from "./events.js";

/**
 * Represents a virtual DOM element.
 *
 * Stores an HTML tag name, its attributes, and its children.
 *
 * @class
 */
export class VElement {
    tagsName;
    attrs;
    children;

    /**
     * Creates a virtual DOM element.
     *
     * @param {string} tagsName - The HTML tag name.
     * @param {Object} attrs - The element attributes.
     * @param {Array<VElement>} children - The child elements.
     * @throws {Error} if any parameter is invalid
     */
    constructor(tagsName, attrs = {}, children = []) {
        if (
            !this.#checkTagName(tagsName) ||
            !this.#checkAtters(attrs) ||
            !this.#checkChildren(children)
        ) {
            throw new TypeError("Invalid VElement arguments");
        }

        this.tagsName = tagsName;
        this.attrs = attrs;
        this.children = children;
    }

    /**
     * validate the virtual elemant tag name
     * 
     * @param {string} tagName 
     * @returns {boolean} validated or not
     */
    #checkTagName(tagName = "") {
        if (typeof tagName !== "string" || tagName.trim().length === 0) {
            console.error(`invalid tag name: ${tagName}`);
            return false;
        }

        return true;
    }

    /**
     * checking the validation of the keys and values of an artibute. it make sure they follow
     * the correct types and check if its a listener if its a function
     * 
     * @param {object} attrs 
     * @returns {boolean} validated or not
     */
    #checkAtters(attrs = {}) {
        if (typeof attrs == undefined || attrs == null) return;
        if (
            typeof attrs !== "object" ||
            attrs === null ||
            Array.isArray(attrs)
        ) {
            console.error(`invalid attrs: ${attrs}`);
            return false;
        }

        for (const [k, v] of Object.entries(attrs)) {
            if (typeof k !== "string" || k.trim().length === 0) {
                console.error(`invalid key attribute: ${k}`);
                return false;
            }

            const vType = typeof v;

            if (vType === "function") {
                if (!isTypeEventListener(v)) {
                    console.error(`invalid event listener for "${k}"`);
                    return false;
                }

                continue;
            }

            if (
                vType !== "string" &&
                vType !== "boolean" &&
                vType !== "number"
            ) {
                console.error(
                    `invalid attribute value for "${k}": ${vType}`
                );
                return false;
            }

            if (vType === "number" && !Number.isFinite(v)) {
                console.error(`invalid number for attribute "${k}"`);
                return false;
            }
        }

        return true;
    }

    /**
     * checking the children of a virtual elemant by checking if they are an instance of VElemant class
     * or if it is a string
     * 
     * @param {Array<VElement>} children 
     * @returns {boolean} validated or not
     */
    #checkChildren(children = []) {
        if (typeof children === "undefined" || children === null) return;
        if (!Array.isArray(children)) {
            console.error("children must be an array");
            return false;
        }

        for (const child of children) {
            if (!(child instanceof VElement) && typeof child !== "string") {
                console.error(`invalid element child: ${child}`);
                return false;
            }
        }

        return true;
    }
}
