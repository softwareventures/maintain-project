import type {ProjectSource} from "../project/project";
import type {ReadJsonFailureReason} from "../project/read-json";
import {readProjectJson} from "../project/read-json";
import type {Result} from "../result/result";
import {mapResultFn} from "../result/result";
import type {File} from "../fs-stage/file";
import {textFile} from "../fs-stage/file";
import {formatPackageJson} from "./format-package-json";

export async function modifyPackageJson(
    project: ProjectSource,
    // FIXME Use type-fest PackageJson type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modify: (packageJson: any) => any
): Promise<Result<ReadJsonFailureReason, File>> {
    return readProjectJson(project, "package.json")
        .then(mapResultFn(modify))
        .then(mapResultFn(formatPackageJson))
        .then(mapResultFn(textFile));
}
