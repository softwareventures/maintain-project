import {FsStage, insert, InsertResult} from "../../fs-stage/fs-stage";
import {copy} from "../../template/copy";
import {Project} from "../project";

export function writeRenovateConfig(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    const file =
        project.target === "npm"
            ? copy("renovate.lib.template.json")
            : copy("renovate.app.template.json");

    return async fsStage => file.then(file => insert(fsStage, "renovate.json", file));
}
