import {filterFn, mapFn} from "@softwareventures/array";
import {applyAsync} from "@softwareventures/promise";
import {FsStage, insertFn, InsertResult} from "../fs-stage/fs-stage";
import {chainAsyncResults, chainAsyncResultsFn} from "../result/result";
import {copyFromTemplate} from "../template/copy";
import {listTemplates} from "../template/list";
import {Project} from "../project/project";
import {writeIdeaDictionary} from "./write-dictionary";
import {writeIdeaModuleIml} from "./write-module-iml";
import {writeIdeaModulesXml} from "./write-modules-xml";
import {writeIdeaRunConfigurations} from "./write-run-configurations";

export function writeIdeaProjectFiles(
    project: Project
): (fsStage: FsStage) => Promise<InsertResult> {
    return chainAsyncResultsFn([
        writeIdeaMiscFiles,
        writeIdeaModulesXml(project),
        writeIdeaModuleIml(project),
        writeIdeaDictionary,
        writeIdeaRunConfigurations(project)
    ]);
}

async function writeIdeaMiscFiles(fsStage: FsStage): Promise<InsertResult> {
    return listTemplates("idea.template")
        .then(filterFn(path => path.split("/")[0] !== "dictionaries"))
        .then(filterFn(path => path.split("/")[0] !== "runConfigurations"))
        .then(filterFn(path => path !== "workspace.xml"))
        .then(filterFn(path => path !== "task.xml"))
        .then(filterFn(path => !path.match(/\.iml$/)))
        .then(filterFn(path => path !== "modules.xml"))
        .then(
            mapFn(async path =>
                copyFromTemplate(`idea.template/${path}`).then(file =>
                    insertFn(`.idea/${path}`, file)
                )
            )
        )
        .then(mapFn(applyAsync))
        .then(async actions => chainAsyncResults(fsStage, actions));
}
