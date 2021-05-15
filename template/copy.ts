import {promises as fs} from "fs";
import {File} from "../fs-stage/file";

export async function copyFromTemplate(source: string): Promise<File> {
    const sourcePath = require.resolve(`./template/${source}`);

    return fs.readFile(sourcePath).then(data => ({type: "file", data}));
}
