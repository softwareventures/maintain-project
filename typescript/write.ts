import {FsStage, insert, insertFn, InsertResult} from "../fs-stage/fs-stage";
import {chainAsyncResultsFn, chainResults, success} from "../result/result";
import {copyFromTemplate} from "../template/copy";
import {Project} from "../project/project";

export function writeTypeScriptFiles(
    project: Project
): (fsStage: FsStage) => Promise<InsertResult> {
    return chainAsyncResultsFn([
        async fsStage =>
            copyFromTemplate("index.ts").then(file => insert(fsStage, "index.ts", file)),
        async fsStage =>
            copyFromTemplate("index.test.ts").then(file => insert(fsStage, "index.test.ts", file)),
        writeTsConfigFiles(project),
        writeTypeDeclarations(project)
    ]);
}

function writeTsConfigFiles(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    const tsConfigJson =
        project.target === "webapp"
            ? copyFromTemplate("tsconfig.webapp.template.json")
            : copyFromTemplate("tsconfig.template.json");
    const tsConfigTestJson =
        project.target === "webapp"
            ? copyFromTemplate("tsconfig.webapp.test.template.json")
            : copyFromTemplate("tsconfig.test.template.json");

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
        const file = copyFromTemplate("types/preact-debug.d.ts");
        return async fsStage => file.then(file => insert(fsStage, "types/preact-debug.d.ts", file));
    } else {
        return async fsStage => success(fsStage);
    }
}
