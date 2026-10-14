import { VElement } from "../utils/elemant.js";
/**
    * create a virtual elemant as a represintation of DOM elemant and return it
    * 
    * @param {string} tagsName - The HTML tag name
    * @param {Object} [attrs] - The element attributes
    * @param {Array<VElement>} [children] - The child elements
    * @returns  {VElement|null} - the virtual elemant or null if failed
 */
export function createElem(tagName, attrs, children) {
    try {
        const vElem = new VElement(tagName, attrs, children);
        return vElem;
    } catch (err) {
        console.error(err);
        return null;
    }
}