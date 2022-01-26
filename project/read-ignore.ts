import {basename, dirname, join} from "path";
import {Ignore} from "../ignore/ignore";
import {readIgnore} from "../ignore/read";
import {ProjectSource} from "./project";
import {readProjectDirectory} from "./read-directory";
import {readProjectText} from "./read-text";

export async function readProjectIgnore(project: ProjectSource, name: string): Promise<Ignore> {
    return readIgnore({
        path: name,
        dirname,
        basename,
        join,
        readDirectory: async path => readProjectDirectory(project, path),
        readText: async path => readProjectText(project, path)
    });
}
