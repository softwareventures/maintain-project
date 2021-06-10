import {ProjectSource} from "../project/project";
import {mapResultFn, Result} from "../result/result";
import {ReadJsonFailureReason, readProjectJson} from "../project/read-json";
import {File, textFile} from "../fs-stage/file";
import {formatPackageJson} from "./format-package-json";

export async function modifyProjectScript(
    project: ProjectSource,
    name: string,
    modify: (text: string | null) => string | null
): Promise<Result<ReadJsonFailureReason, File>> {
    return readProjectJson(project, "package.json")
        .then(
            mapResultFn(json => ({
                ...json,
                scripts: {
                    ...json?.scripts,
                    [name]: modify(json?.scripts?.[name]) ?? undefined
                }
            }))
        )
        .then(mapResultFn(formatPackageJson))
        .then(mapResultFn(textFile));
}
