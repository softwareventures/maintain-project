import {projectDevDependsOn} from "../project/dev-depends-on";
import {ProjectSource} from "../project/project";

export async function isEslintProject(project: ProjectSource): Promise<boolean> {
    return projectDevDependsOn(project, "eslint");
}
