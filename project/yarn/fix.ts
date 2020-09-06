import {Result} from "../../task/result";
import {yarn} from "./yarn";

export async function yarnFix(dir: string): Promise<Result> {
    return yarn(dir, "fix").then(result =>
        result.type === "yarn-failed" ? {type: "yarn-fix-failed"} : result
    );
}
