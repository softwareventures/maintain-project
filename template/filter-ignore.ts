import {promises as fs} from "fs";
import {filterFn} from "@softwareventures/array";
import {File} from "../fs-stage/file";

export async function filterIgnore(
    source: string,
    filter: (line: string) => boolean
): Promise<File> {
    const sourcePath = require.resolve(`./template/${source}`);
    const text = fs.readFile(sourcePath, "utf-8");
    const filteredText = text
        .then(text => text.split(/\r?\n/))
        .then(filterFn(filter))
        .then(lines => lines.join("\n"));
    const data = filteredText.then(text => new TextEncoder().encode(text));
    return data.then(data => ({type: "file", data}));
}
