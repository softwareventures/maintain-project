import type {Dirent} from "fs";
import {promises as fs} from "fs";
import {resolve} from "path";
import type {ProjectSource} from "./project";

export async function readProjectDirectory(
    project: ProjectSource,
    path: string
): Promise<Dirent[]> {
    return fs.readdir(resolve(project.path, path), {withFileTypes: true});
}
