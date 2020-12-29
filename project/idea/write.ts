import {mapFn} from "@softwareventures/array";
import {FsChangeset, insertFn, InsertResult} from "../../fs-changeset/fs-changeset";
import {liftFunctionFromPromise} from "../../promises/promises";
import {chainAsyncResults, chainAsyncResultsFn} from "../../result/result";
import {copy} from "../../template/copy";
import {listTemplates} from "../../template/list";
import {Project} from "../project";
import {writeIdeaDictionaries} from "./dictionary/write";
import {writeIdeaModuleIml} from "./write-module-iml";
import {writeIdeaModulesXml} from "./write-modules-xml";
import {writeIdeaRunConfigurations} from "./write-run-configurations";

export function writeIdeaProjectFiles(
    project: Project
): (fsChangeset: FsChangeset) => Promise<InsertResult> {
    return chainAsyncResultsFn([
        writeIdeaMiscFiles,
        writeIdeaModulesXml(project),
        writeIdeaModuleIml(project),
        writeIdeaDictionaries(project),
        writeIdeaRunConfigurations(project)
    ]);
}

async function writeIdeaMiscFiles(fsChangeset: FsChangeset): Promise<InsertResult> {
    return listTemplates("idea.template")
        .then(
            mapFn(async path =>
                copy(`idea.template/${path}`).then(file => insertFn(`.idea/${path}`, file))
            )
        )
        .then(mapFn(liftFunctionFromPromise))
        .then(async actions => chainAsyncResults(fsChangeset, actions));
}
