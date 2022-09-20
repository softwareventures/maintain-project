import type {FsStage, InsertResult} from "../fs-stage/fs-stage";
import {insert, insertFn} from "../fs-stage/fs-stage";
import {chainAsyncResultsFn, chainResults, success} from "../result/result";
import {copyFromTemplate} from "../template/copy";
import type {Project} from "../project/project";
import {projectTemplateId} from "../template/project-template-id";

export function writeTypeScriptFiles(
    project: Project
): (fsStage: FsStage) => Promise<InsertResult> {
    return chainAsyncResultsFn([
        async fsStage =>
            copyFromTemplate(projectTemplateId(project), "index.ts").then(file =>
                insert(fsStage, "index.ts", file)
            ),
        async fsStage =>
            copyFromTemplate(projectTemplateId(project), "index.test.ts").then(file =>
                insert(fsStage, "index.test.ts", file)
            ),
        writeTsConfigFiles(project),
        writeTypeDeclarations(project)
    ]);
}

function writeTsConfigFiles(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    const tsConfigJson = copyFromTemplate(projectTemplateId(project), "tsconfig.json");
    const tsConfigTestJson = copyFromTemplate(projectTemplateId(project), "tsconfig.test.json");

    return async fsStage =>
        Promise.all([tsConfigJson, tsConfigTestJson]).then(([tsConfigJson, tsConfigTestJson]) =>
            chainResults(fsStage, [
                insertFn("tsconfig.json", tsConfigJson),
                insertFn("tsconfig.test.json", tsConfigTestJson)
            ])
        );
}

function writeTypeDeclarations(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    if (project.target === "webapp") {
        const file = copyFromTemplate(projectTemplateId(project), "types/preact-debug.d.ts");
        return async fsStage => file.then(file => insert(fsStage, "types/preact-debug.d.ts", file));
    } else {
        return async fsStage => success(fsStage);
    }
}
