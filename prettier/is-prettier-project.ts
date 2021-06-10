import {ProjectSource} from "../project/project";
import {projectDevDependsOn} from "../project/dev-depends-on";
import {readProjectScript} from "../project/read-script";

export async function isPrettierProject(project: ProjectSource): Promise<boolean> {
    return Promise.all([
        projectDevDependsOn(project, "prettier"),
        readProjectScript(project, "prettier")
    ]).then(
        ([hasDependency, script]) =>
            hasDependency && (script == null || script.trim() === "prettier")
    );
}
