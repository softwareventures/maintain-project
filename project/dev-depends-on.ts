import {isSuccess, mapResultFn} from "../result/result.js";
import type {ProjectSource} from "./project.js";
import {readProjectJson} from "./read-json.js";

export async function projectDevDependsOn(
    project: ProjectSource,
    dependency: string
): Promise<boolean> {
    return readProjectJson(project, "package.json")
        .then(
            mapResultFn(
                packageJson =>
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    typeof packageJson?.dependencies?.[dependency] === "string" ||
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    typeof packageJson?.devDependencies?.[dependency] === "string"
            )
        )
        .then(result => isSuccess(result) && result.value);
}
