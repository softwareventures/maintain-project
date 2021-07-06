import {fork} from "child_process";
import {failure, Result, success} from "../result/result";

export type YarnResult = Result<YarnFailureReason>;

export interface YarnFailureReason {
    readonly type: "yarn-failed";
    readonly code: number | null;
}

export async function yarn(dir: string, ...args: string[]): Promise<YarnResult> {
    return new Promise((resolve, reject) =>
        fork(require.resolve("yarn/bin/yarn.js"), args, {cwd: dir, stdio: "ignore"})
            .on("error", reject)
            .on("exit", code => {
                if (code === 0) {
                    resolve(success());
                } else {
                    resolve(failure([{type: "yarn-failed", code}]));
                }
            })
    );
}
