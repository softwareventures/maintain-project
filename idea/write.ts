import {filterFn, mapFn} from "@softwareventures/array";
import {applyAsync} from "@softwareventures/promise";
import type {FsStage, InsertResult} from "../fs-stage/fs-stage.js";
import {insertFn} from "../fs-stage/fs-stage.js";
import {chainAsyncResults, chainAsyncResultsFn} from "../result/result.js";
import {copyFromTemplate} from "../template/copy.js";
import {listTemplateFiles} from "../template/list.js";
import type {Project} from "../project/project.js";
import {projectTemplateId} from "../template/project-template-id.js";
import {writeIdeaDictionary} from "./write-dictionary.js";
import {writeIdeaModuleIml} from "./write-module-iml.js";
import {writeIdeaModulesXml} from "./write-modules-xml.js";
import {writeIdeaRunConfigurations} from "./write-run-configurations.js";

export function writeIdeaProjectFiles(
    project: Project
): (fsStage: FsStage) => Promise<InsertResult> {
    return chainAsyncResultsFn([
        writeIdeaMiscFiles(project),
        writeIdeaModulesXml(project),
        writeIdeaModuleIml(project),
        writeIdeaDictionary,
        writeIdeaRunConfigurations(project)
    ]);
}

function writeIdeaMiscFiles(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    return async fsStage =>
        listTemplateFiles(projectTemplateId(project), ".idea")
            .then(filterFn(path => path.split("/")[0] !== "dictionaries"))
            .then(filterFn(path => path.split("/")[0] !== "runConfigurations"))
            .then(filterFn(path => path !== "workspace.xml"))
            .then(filterFn(path => path !== "task.xml"))
            .then(filterFn(path => !path.endsWith(".iml")))
            .then(filterFn(path => path !== "modules.xml"))
            .then(
                mapFn(async path =>
                    copyFromTemplate(projectTemplateId(project), ".idea", path).then(file =>
                        insertFn(`.idea/${path}`, file)
                    )
                )
            )
            .then(mapFn(applyAsync))
            .then(async actions => chainAsyncResults(fsStage, actions));
}
