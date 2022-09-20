import type {FsStage, InsertResult} from "../fs-stage/fs-stage";
import {insert} from "../fs-stage/fs-stage";
import {copyFromTemplate} from "../template/copy";
import type {Project} from "../project/project";
import {projectTemplateId} from "../template/project-template-id";

export function writeRenovateConfig(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    const file = copyFromTemplate(projectTemplateId(project), "renovate.json");
    return async fsStage => file.then(file => insert(fsStage, "renovate.json", file));
}
