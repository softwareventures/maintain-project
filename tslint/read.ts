import {Configuration} from "tslint";
import {mapNullable} from "@softwareventures/nullable";
import type {ProjectSource} from "../project/project.js";
import {projectDevDependsOn} from "../project/dev-depends-on.js";
import type {TslintProject} from "./tslint-project.js";

export async function readTslintProject(
    project: ProjectSource
): Promise<TslintProject | undefined> {
    const dependsOnTslint = projectDevDependsOn(project, "tslint");
    const dependsOnSoftwareVenturesPreset = projectDevDependsOn(
        project,
        "@softwareventures/tslint-rules"
    );
    const configPath = Configuration.findConfigurationPath(null, project.path);
    const config = mapNullable(configPath, path => Configuration.readConfigurationFile(path));

    if (!(await dependsOnTslint) || config == null) {
        return undefined;
    } else if (
        (await dependsOnSoftwareVenturesPreset) &&
        (config.extends?.includes("@softwareventures/tslint-rules") ?? false)
    ) {
        return {preset: "softwareventures"};
    } else {
        return {preset: "other"};
    }
}
