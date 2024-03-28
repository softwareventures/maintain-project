import {and} from "@softwareventures/array";
import type {ProjectSource} from "../project/project.js";
import {projectFileExists} from "../project/file-exists.js";
import {projectDevDependsOn} from "../project/dev-depends-on.js";

export async function isTypescriptProject(project: ProjectSource): Promise<boolean> {
    return Promise.all([
        projectDevDependsOn(project, "typescript"),
        projectFileExists(project, "tsconfig.json")
    ]).then(and);
}
