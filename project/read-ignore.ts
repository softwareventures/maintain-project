import {basename, dirname, join} from "path";
import type {Ignore} from "../ignore/ignore.js";
import {readIgnore} from "../ignore/read.js";
import type {ProjectSource} from "./project.js";
import {readProjectDirectory} from "./read-directory.js";
import {readProjectText} from "./read-text.js";

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
