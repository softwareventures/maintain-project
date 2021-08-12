import {projectDevDependsOn} from "../project/dev-depends-on";
import {ProjectSource} from "../project/project";

export async function isTslintProject(project: ProjectSource): Promise<boolean> {
    return projectDevDependsOn(project, "tslint");
}
