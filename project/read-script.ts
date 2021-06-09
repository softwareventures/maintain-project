import {mapNullableFn} from "@softwareventures/nullable";
import {mapResultFn, toNullable} from "../result/result";
import {ProjectSource} from "./project";
import {readProjectJson} from "./read-json";

export async function readProjectScript(
    project: ProjectSource,
    scriptName: string
): Promise<string | null> {
    return readProjectJson(project, "package.json")
        .then(mapResultFn(packageJson => packageJson?.scripts?.[scriptName]))
        .then(toNullable)
        .then(mapNullableFn(script => String(script)));
}
