import {promises as fs} from "fs";
import {dirname} from "path";
import {filterFn} from "@softwareventures/array";
import {Result} from "./result";

export async function filterIgnore(
    source: string,
    dest: string,
    filter: (line: string) => boolean
): Promise<Result> {
    const sourcePath = require.resolve(`../template/${source}`);
    const text = fs.readFile(sourcePath, "utf8");
    const filteredText = text
        .then(text => text.split(/\r?\n/))
        .then(filterFn(filter))
        .then(lines => lines.join("\n"));
    return fs
        .mkdir(dirname(dest), {recursive: true})
        .then(async () => filteredText)
        .then(async filteredText =>
            fs.writeFile(dest, filteredText, {encoding: "utf8", flag: "wx"})
        )
        .then(async () => ({type: "success"}));
}
