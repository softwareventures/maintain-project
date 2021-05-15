import {promises as fs} from "fs";
import {File} from "../fs-stage/file";

export async function copyFromTemplate(path: string): Promise<File> {
    const sourcePath = require.resolve(`./template/${path}`);

    return fs.readFile(sourcePath).then(data => ({type: "file", data}));
}
