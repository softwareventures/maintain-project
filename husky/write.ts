import {mapFn} from "@softwareventures/array";
import {allAsync} from "@softwareventures/promise";
import {Project} from "../project/project";
import {FsStage, insertFn, InsertResult} from "../fs-stage/fs-stage";
import {copyFromTemplate} from "../template/copy";
import {projectTemplateId} from "../template/project-template-id";
import {chainResults} from "../result/result";

export function writeHuskyConfig(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    return async fsStage =>
        Promise.resolve(["common.sh", "pre-commit", "commit-msg"])
            .then(
                mapFn(async filename =>
                    copyFromTemplate(projectTemplateId(project), ".husky", filename).then(file => ({
                        filename,
                        file
                    }))
                )
            )
            .then(allAsync)
            .then(mapFn(({filename, file}) => insertFn(`.husky/${filename}`, file)))
            .then(async insertions => chainResults(fsStage, insertions));
}
