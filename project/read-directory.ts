import {Dirent, promises as fs} from "fs";
import {resolve} from "path";
import {ProjectSource} from "./project";

export async function readProjectDirectory(
    project: ProjectSource,
    path: string
): Promise<Dirent[]> {
    return fs.readdir(resolve(project.path, path), {withFileTypes: true});
}
