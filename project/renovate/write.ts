import {FsChangeset, insert, InsertResult} from "../../fs-changeset/fs-changeset";
import {copy} from "../../template/copy";
import {Project} from "../project";

export function writeRenovateConfig(
    project: Project
): (fsChangeset: FsChangeset) => Promise<InsertResult> {
    const file =
        project.target === "npm"
            ? copy("renovate.lib.template.json")
            : copy("renovate.app.template.json");

    return async fsChangeset => file.then(file => insert(fsChangeset, "renovate.json", file));
}
