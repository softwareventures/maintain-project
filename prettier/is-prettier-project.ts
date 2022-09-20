import type {ProjectSource} from "../project/project";
import {projectDevDependsOn} from "../project/dev-depends-on";

export async function isPrettierProject(project: ProjectSource): Promise<boolean> {
    return projectDevDependsOn(project, "prettier");
}
