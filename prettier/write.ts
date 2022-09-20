import type {FsStage, InsertResult} from "../fs-stage/fs-stage";
import {insert} from "../fs-stage/fs-stage";
import type {Project} from "../project/project";
import {copyFromTemplate} from "../template/copy";
import {projectTemplateId} from "../template/project-template-id";

export function writePrettierIgnore(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    return async fsStage =>
        copyFromTemplate(projectTemplateId(project), ".prettierignore").then(file =>
            insert(fsStage, ".prettierignore", file)
        );
}
