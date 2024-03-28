import {mapNullable} from "@softwareventures/nullable";
import type {ProjectSource} from "../project/project.js";
import type {Result} from "../result/result.js";
import type {ReadJsonFailureReason} from "../project/read-json.js";
import type {File} from "../fs-stage/file.js";
import {modifyPackageJson} from "./modify-package-json.js";

export async function modifyProjectScript(
    project: ProjectSource,
    name: string,
    modify: (text: string | null) => string | null
): Promise<Result<ReadJsonFailureReason, File>> {
    return modifyPackageJson(
        project,
        json =>
            ({
                ...json,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                scripts: {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    ...json?.scripts,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    [name]: modify(mapNullable(json?.scripts?.[name], String)) ?? undefined
                }
            }) as unknown
    );
}
