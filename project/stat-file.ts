import type {BigIntStats} from "fs";
import {promises as fs} from "fs";
import {resolve} from "path";
import type {ProjectSource} from "./project";

export async function statProjectFile(project: ProjectSource, path: string): Promise<BigIntStats> {
    return fs.stat(resolve(project.path, path), {bigint: true});
}
