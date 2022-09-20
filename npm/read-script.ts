import {mapNullableFn} from "@softwareventures/nullable";
import {mapResultFn, toNullable} from "../result/result";
import type {ProjectSource} from "../project/project";
import {readProjectJson} from "../project/read-json";

export async function readProjectScript(
    project: ProjectSource,
    scriptName: string
): Promise<string | null> {
    return (
        readProjectJson(project, "package.json")
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            .then(mapResultFn(packageJson => packageJson?.scripts?.[scriptName] as unknown))
            .then(toNullable)
            .then(mapNullableFn(script => String(script)))
    );
}
