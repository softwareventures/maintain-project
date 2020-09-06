import {constants, promises as fs} from "fs";
import {dirname, resolve} from "path";
import {Result} from "./result";

export async function copy(
    source: string,
    destDir: string,
    destFile: string = source
): Promise<Result> {
    const sourcePath = require.resolve("../template/" + source);
    const destPath = resolve(destDir, destFile);

    return fs
        .mkdir(dirname(destPath), {recursive: true})
        .then(async () => fs.copyFile(sourcePath, destPath, constants.COPYFILE_EXCL))
        .then(
            () => ({type: "success"}),
            reason => {
                if (reason.code === "EEXIST") {
                    return {type: "not-empty"};
                } else {
                    throw reason;
                }
            }
        );
}
