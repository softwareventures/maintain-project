import {promises as fs} from "fs";
import {dirname} from "path";
import {Result} from "./result";

export async function writeFile(path: string, text: string): Promise<Result> {
    return fs
        .mkdir(dirname(path), {recursive: true})
        .then(async () => fs.writeFile(path, text, {encoding: "utf8", flag: "wx"}))
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
