import {resolve} from "path";
import {filterIgnore} from "../../task/filter-ignore";
import {Result} from "../../task/result";
import {Project} from "../project";

export async function writePrettierIgnore(project: Project): Promise<Result> {
    return filterIgnore(
        "prettierignore.template",
        resolve(project.path, ".prettierignore"),
        line =>
            (line !== "/dist" || project.target === "webapp") &&
            (line !== "*.js" || project.target === "npm") &&
            (line !== "*.d.ts" || project.target === "npm") &&
            (line !== "*.js.map" || project.target === "npm") &&
            (line !== "!/types/*.d.ts" || project.target === "npm")
    );
}
