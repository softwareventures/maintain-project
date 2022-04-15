import {FsStage, insert, InsertResult} from "../fs-stage/fs-stage";
import {Project} from "../project/project";
import {copyFromTemplate} from "../template/copy";
import {projectTemplateId} from "../template/project-template-id";

export function writeCommitlintConfig(
    project: Project
): (fsStage: FsStage) => Promise<InsertResult> {
    return async fsStage =>
        copyFromTemplate(projectTemplateId(project), "commitlint.config.cjs").then(file =>
            insert(fsStage, "commitlint.config.cjs", file)
        );
}
