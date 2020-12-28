import {FsChangeset, insert, InsertResult} from "../../fs-changeset/fs-changeset";
import {filterIgnore} from "../../template/filter-ignore";
import {Project} from "../project";

export function writePrettierIgnore(
    project: Project
): (fsChangeset: FsChangeset) => Promise<InsertResult> {
    return async fsChangeset =>
        filterIgnore(
            "prettierignore.template",
            line =>
                (line !== "/dist" || project.target === "webapp") &&
                (line !== "*.js" || project.target === "npm") &&
                (line !== "*.d.ts" || project.target === "npm") &&
                (line !== "*.js.map" || project.target === "npm") &&
                (line !== "!/types/*.d.ts" || project.target === "npm")
        ).then(file => insert(fsChangeset, ".prettierignore", file));
}
