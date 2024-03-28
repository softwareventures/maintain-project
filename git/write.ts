import type {FsStage, InsertResult} from "../fs-stage/fs-stage.js";
import {insert} from "../fs-stage/fs-stage.js";
import type {Project} from "../project/project.js";
import {copyFromTemplate} from "../template/copy.js";
import {projectTemplateId} from "../template/project-template-id.js";

export function writeGitIgnore(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    return async fsStage =>
        copyFromTemplate(projectTemplateId(project), "gitignore.template").then(file =>
            insert(fsStage, ".gitignore", file)
        );
}
