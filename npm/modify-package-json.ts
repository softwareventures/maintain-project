import type {ProjectSource} from "../project/project.js";
import type {ReadJsonFailureReason} from "../project/read-json.js";
import {readProjectJson} from "../project/read-json.js";
import type {Result} from "../result/result.js";
import {mapResultFn} from "../result/result.js";
import type {File} from "../fs-stage/file.js";
import {textFile} from "../fs-stage/file.js";
import {formatPackageJson} from "./format-package-json.js";

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
