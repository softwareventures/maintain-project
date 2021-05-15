import {promises as fs} from "fs";
import {resolve} from "path";
import {ProjectSource} from "./project";

export async function readProjectText(project: ProjectSource, path: string): Promise<string> {
    return fs.readFile(resolve(project.path, path), "utf-8");
}
