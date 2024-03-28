import type {Update} from "../project/update.js";
import type {Project} from "../project/project.js";
import {yarnFixIfAvailable} from "./fix.js";

export async function applyCodeStyle(project: Project): Promise<Update | null> {
    return {
        type: "direct-update",
        log: "style: apply code style",
        apply: async () => yarnFixIfAvailable(project)
    };
}
