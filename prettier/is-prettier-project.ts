import type {ProjectSource} from "../project/project.js";
import {projectDevDependsOn} from "../project/dev-depends-on.js";

export async function isPrettierProject(project: ProjectSource): Promise<boolean> {
    return projectDevDependsOn(project, "prettier");
}
