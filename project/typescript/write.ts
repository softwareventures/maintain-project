import {FsChangeset, insert, insertFn, InsertResult} from "../../fs-changeset/fs-changeset";
import {chainAsyncResultsFn, chainResults} from "../../result/result";
import {copy} from "../../template/copy";
import {Project} from "../project";

export function writeTypeScriptFiles(
    project: Project
): (fsChangeset: FsChangeset) => Promise<InsertResult> {
    return chainAsyncResultsFn([
        async fsChangeset => copy("index.ts").then(file => insert(fsChangeset, "index.ts", file)),
        async fsChangeset =>
            copy("index.test.ts").then(file => insert(fsChangeset, "index.test.ts", file)),
        writeTsConfigFiles(project),
        writeTypeDeclarations(project)
    ]);
}

function writeTsConfigFiles(project: Project): (fsChangeset: FsChangeset) => Promise<InsertResult> {
    const tsConfigJson =
        project.target === "webapp"
            ? copy("tsconfig.webapp.template.json")
            : copy("tsconfig.template.json");
    const tsConfigTestJson =
        project.target === "webapp"
            ? copy("tsconfig.webapp.test.template.json")
            : copy("tsconfig.test.template.json");

    return async fsChangeset =>
        Promise.all([tsConfigJson, tsConfigTestJson]).then(([tsConfigJson, tsConfigTestJson]) =>
            chainResults(fsChangeset, [
                insertFn("tsconfig.json", tsConfigJson),
                insertFn("tsconfig.test.json", tsConfigTestJson)
            ])
        );
}

function writeTypeDeclarations(
    project: Project
): (fsChangeset: FsChangeset) => Promise<InsertResult> {
    if (project.target === "webapp") {
        const file = copy("types/preact-debug.d.ts");
        return async fsChangeset =>
            file.then(file => insert(fsChangeset, "types/preact-debug.d.ts", file));
    } else {
        return async fsChangeset => ({type: "success", value: fsChangeset});
    }
}
