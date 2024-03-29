import type {FsStage, InsertResult} from "../fs-stage/fs-stage.js";
import {insert} from "../fs-stage/fs-stage.js";
import {copyFromTemplate} from "../template/copy.js";
import type {Project} from "../project/project.js";
import {projectTemplateId} from "../template/project-template-id.js";

export function writeRenovateConfig(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    const file = copyFromTemplate(projectTemplateId(project), "renovate.json.template");
    return async fsStage => file.then(file => insert(fsStage, "renovate.json", file));
}
