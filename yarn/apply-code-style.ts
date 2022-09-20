import type {Update} from "../project/update";
import type {Project} from "../project/project";
import {yarnFixIfAvailable} from "./fix";

export async function applyCodeStyle(project: Project): Promise<Update | null> {
    return {
        type: "direct-update",
        log: "style: apply code style",
        apply: async () => yarnFixIfAvailable(project)
    };
}
