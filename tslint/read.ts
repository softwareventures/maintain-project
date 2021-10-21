import {Configuration} from "tslint";
import {mapNullable} from "@softwareventures/nullable";
import {ProjectSource} from "../project/project";
import {projectDevDependsOn} from "../project/dev-depends-on";
import {TslintProject} from "./tslint-project";

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

    if (!(await dependsOnTslint)) {
        return undefined;
    } else if (
        (await dependsOnSoftwareVenturesPreset) &&
        config?.extends?.includes("@softwareventures/tslint-rules")
    ) {
        return {preset: "softwareventures"};
    } else {
        return {preset: "other"};
    }
}
