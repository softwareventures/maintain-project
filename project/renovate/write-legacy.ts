import {copy} from "../../task/copy";
import {Result} from "../../task/result";
import {Project} from "../project";

export async function writeRenovateConfig(project: Project): Promise<Result> {
    if (project.target === "npm") {
        return copy("renovate.lib.template.json", project.path, "renovate.json");
    } else {
        return copy("renovate.app.template.json", project.path, "renovate.json");
    }
}
