import {Result} from "../../task/result";
import {yarn} from "./yarn";

export async function yarnInstall(dir: string): Promise<Result> {
    return yarn(dir).then(result =>
        result.type === "yarn-failed" ? {type: "yarn-install-failed"} : result
    );
}
