import {FsStage, insert, InsertResult} from "../fs-stage/fs-stage";
import {copyFromTemplate} from "../template/copy";
import {Project} from "../project/project";

export function writeRenovateConfig(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    const file =
        project.target === "npm"
            ? copyFromTemplate("renovate.lib.template.json")
            : copyFromTemplate("renovate.app.template.json");

    return async fsStage => file.then(file => insert(fsStage, "renovate.json", file));
}
