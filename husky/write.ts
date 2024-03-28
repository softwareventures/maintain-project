import {mapFn} from "@softwareventures/array";
import {allAsync} from "@softwareventures/promise";
import type {Project} from "../project/project.js";
import type {FsStage, InsertResult} from "../fs-stage/fs-stage.js";
import {insertFn} from "../fs-stage/fs-stage.js";
import {copyFromTemplate} from "../template/copy.js";
import {projectTemplateId} from "../template/project-template-id.js";
import {chainResults} from "../result/result.js";

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
