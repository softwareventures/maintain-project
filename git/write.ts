import {FsStage, insert, InsertResult} from "../fs-stage/fs-stage";
import {Project} from "../project/project";
import {copyFromTemplate} from "../template/copy";
import {projectTemplateId} from "../template/project-template-id";

export function writeGitIgnore(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    return async fsStage =>
        copyFromTemplate(projectTemplateId(project), "gitignore.template").then(file =>
            insert(fsStage, ".gitignore", file)
        );
}
