import {ProjectSource} from "../project/project";
import {Result} from "../result/result";
import {ReadJsonFailureReason} from "../project/read-json";
import {File} from "../fs-stage/file";
import {modifyPackageJson} from "./modify-package-json";

export async function modifyProjectScript(
    project: ProjectSource,
    name: string,
    modify: (text: string | null) => string | null
): Promise<Result<ReadJsonFailureReason, File>> {
    return modifyPackageJson(project, json => ({
        ...json,
        scripts: {
            ...json?.scripts,
            [name]: modify(json?.scripts?.[name]) ?? undefined
        }
    }));
}
