import type {Project} from "../project/project.js";
import type {FsStageUpdate} from "../project/update.js";
import {updateLintFixScript} from "./update-lint-fix-script.js";

export async function updateFixScript(project: Project): Promise<FsStageUpdate | null> {
    return updateLintFixScript(project, "fix");
}
