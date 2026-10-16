import { ref } from "../../src/index.js";
import { LIMITS } from "../config/constants.js";
import { prepareFile } from "../utils/files.js";
import { plural } from "../utils/text.js";
import { notify } from "./notice.js";
import { storageUsed } from "./todos.js";

export const busy = ref("busy", false);

export const dragOver = ref("dragOver", null);

export async function attachFiles(chosen, target) {
    if (chosen.length === 0) return;

    const room = LIMITS.files - target.get().length;
    const tooMany = `A todo can have ${plural(LIMITS.files, "file")} at most.`;
    if (room <= 0) {
        notify(tooMany);
        return;
    }

    busy.value = true;
    const results = await Promise.allSettled(chosen.slice(0, room).map(prepareFile));
    busy.value = false;

    const problems = chosen.length > room ? [tooMany] : [];
    const added = [];
    let used = storageUsed() + target.pending();

    for (const result of results) {
        if (result.status === "rejected") {
            problems.push(result.reason instanceof Error ? result.reason.message : "Could not add the file.");
            continue;
        }
        if (used + result.value.data.length > LIMITS.storage) {
            problems.push("Browser storage is almost full. Remove some files first.");
            break;
        }
        used += result.value.data.length;
        added.push(result.value);
    }

    if (added.length > 0) target.set([...target.get(), ...added].slice(0, LIMITS.files));
    if (problems.length > 0) notify(problems[0]);
}
