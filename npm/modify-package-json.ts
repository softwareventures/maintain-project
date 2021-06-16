import {ProjectSource} from "../project/project";
import {ReadJsonFailureReason, readProjectJson} from "../project/read-json";
import {mapResultFn, Result} from "../result/result";
import {File, textFile} from "../fs-stage/file";
import {formatPackageJson} from "./format-package-json";

export async function modifyPackageJson(
    project: ProjectSource,
    modify: (packageJson: any) => any
): Promise<Result<ReadJsonFailureReason, File>> {
    return readProjectJson(project, "package.json")
        .then(mapResultFn(modify))
        .then(mapResultFn(formatPackageJson))
        .then(mapResultFn(textFile));
}
