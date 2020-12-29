import {dirname, resolve} from "path";
import recursiveReadDir = require("recursive-readdir");

export async function listTemplates(path: string): Promise<string[]> {
    const templateDir = dirname(require.resolve("./template/index.ts"));
    return recursiveReadDir(resolve(templateDir, path));
}
