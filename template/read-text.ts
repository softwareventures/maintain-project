import {promises as fs} from "fs";

export async function readTemplateText(source: string): Promise<string> {
    const sourcePath = require.resolve(`./template/${source}`);
    return fs.readFile(sourcePath, "utf-8");
}
