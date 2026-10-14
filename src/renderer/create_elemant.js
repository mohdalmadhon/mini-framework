import { VElement } from "../utils/elemant.js";

/**
 * 
 * @param {string} tag 
 * @param {Object<String, any>} attrs 
 * @param {Array<VElement|string>} children 
 */
export function createElemant(tag, attrs, children) {
    try {
        const VElem = new VElement(tag, attrs, children);
        return VElem;
    } catch(err) {
        console.error(err);
        return null;
    }
}