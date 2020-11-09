import {copy} from "../../task/copy";
import {combineResults, Result} from "../../task/result";
import {Project} from "../project";

export async function writeTypeScriptFiles(project: Project): Promise<Result> {
    return combineResults([
        copy("index.ts", project.path),
        copy("index.test.ts", project.path),
        writeTsConfigFiles(project),
        writeTypeDeclarations(project)
    ]);
}

async function writeTsConfigFiles(project: Project): Promise<Result> {
    if (project.target === "webapp") {
        return combineResults([
            copy("tsconfig.webapp.template.json", project.path, "tsconfig.json"),
            copy("tsconfig.webapp.test.template.json", project.path, "tsconfig.test.json")
        ]);
    } else {
        return combineResults([
            copy("tsconfig.template.json", project.path, "tsconfig.json"),
            copy("tsconfig.test.template.json", project.path, "tsconfig.test.json")
        ]);
    }
}

async function writeTypeDeclarations(project: Project): Promise<Result> {
    if (project.target === "webapp") {
        return copy("types/preact-debug.d.ts", project.path);
    } else {
        return {type: "success"};
    }
}
