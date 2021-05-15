import {promises as fs} from "fs";
import {resolve} from "path";
import {Project} from "./project";

export async function readProjectText(project: Project, path: string): Promise<string> {
    return fs.readFile(resolve(project.path, path), "utf-8");
}
