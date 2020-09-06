import {promises as fs} from "fs";
import {Result} from "./result";

export async function mkdir(path: string): Promise<Result> {
    return fs.mkdir(path, {recursive: true}).then(
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
