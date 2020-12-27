import {promises as fs} from "fs";
import {File} from "../fs-changeset/file";

export async function copy(source: string): Promise<File> {
    const sourcePath = require.resolve(`./template/${source}`);

    return fs.readFile(sourcePath).then(data => ({type: "file", data}));
}
