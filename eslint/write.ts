import type {FsStage, InsertResult} from "../fs-stage/fs-stage";
import {insert} from "../fs-stage/fs-stage";
import type {Project} from "../project/project";
import {copyFromTemplate} from "../template/copy";
import {projectTemplateId} from "../template/project-template-id";

export function writeEsLintIgnore(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    return async fsStage =>
        copyFromTemplate(projectTemplateId(project), ".eslintignore").then(file =>
            insert(fsStage, ".eslintignore", file)
        );
}
