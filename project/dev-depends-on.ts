import {isSuccess, mapResultFn} from "../result/result";
import {ProjectSource} from "./project";
import {readProjectJson} from "./read-json";

export async function projectDevDependsOn(
    project: ProjectSource,
    dependency: string
): Promise<boolean> {
    return readProjectJson(project, "package.json")
        .then(
            mapResultFn(
                packageJson =>
                    typeof packageJson?.dependencies?.[dependency] === "string" ||
                    typeof packageJson?.devDependencies?.[dependency] === "string"
            )
        )
        .then(result => isSuccess(result) && result.value);
}
