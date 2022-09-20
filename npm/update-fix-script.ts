import type {Project} from "../project/project";
import type {FsStageUpdate} from "../project/update";
import {updateLintFixScript} from "./update-lint-fix-script";

export async function updateFixScript(project: Project): Promise<FsStageUpdate | null> {
    return updateLintFixScript(project, "fix");
}
