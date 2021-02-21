import {FsStage, insert, InsertResult} from "../../fs-stage/fs-stage";
import {filterIgnore} from "../../template/filter-ignore";
import {Project} from "../project";

export function writeEsLintIgnore(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    return async fsStage =>
        filterIgnore(
            "eslintignore.template",
            line =>
                (line !== "/dist" || project.target === "webapp") &&
                (line !== "*.js" || project.target === "npm") &&
                (line !== "*.d.ts" || project.target === "npm") &&
                (line !== "*.js.map" || project.target === "npm") &&
                (line !== "!/types/*.d.ts" || project.target === "npm")
        ).then(file => insert(fsStage, ".eslintignore", file));
}
