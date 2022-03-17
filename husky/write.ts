import {Project} from "../project/project";
import {FsStage, insert, InsertResult} from "../fs-stage/fs-stage";
import {copyFromTemplate} from "../template/copy";
import {projectTemplateId} from "../template/project-template-id";
import {bindAsyncResultFn} from "../result/result";

export function writeHuskyConfig(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    return async fsStage =>
        copyFromTemplate(projectTemplateId(project), ".husky", "common.sh")
            .then(file => insert(fsStage, ".husky/common.sh", file))
            .then(
                bindAsyncResultFn(async fsStage =>
                    copyFromTemplate(projectTemplateId(project), ".husky", "pre-commit").then(
                        file => insert(fsStage, ".husky/pre-commit", file)
                    )
                )
            );
}
