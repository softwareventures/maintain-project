import type {FsStage, InsertResult} from "../fs-stage/fs-stage";
import {insert} from "../fs-stage/fs-stage";
import type {Project} from "../project/project";
import {projectTemplateId} from "../template/project-template-id";
import {copyFromTemplate} from "../template/copy";

export function writeIdeaModuleIml(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    const imlFilename =
        project.target === "webapp" ? "template-webpack-project.iml" : "template-node-project.iml";

    return async fsStage =>
        copyFromTemplate(projectTemplateId(project), ".idea", imlFilename).then(file =>
            insert(fsStage, `.idea/${project.npmPackage.name}.iml`, file)
        );
}
