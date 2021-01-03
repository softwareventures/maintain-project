import {fork} from "child_process";
import {Result} from "../../result/result";

export type YarnResult = Result<YarnFailureReason>;

export interface YarnFailureReason {
    readonly type: "yarn-failed";
    readonly code: number | null;
}

export async function yarn(dir: string, ...args: string[]): Promise<YarnResult> {
    return new Promise((resolve, reject) =>
        fork(require.resolve("yarn/bin/yarn.js"), args, {cwd: dir, stdio: "inherit"})
            .on("error", reject)
            .on("exit", code => {
                if (code === 0) {
                    resolve({type: "success", value: undefined});
                } else {
                    resolve({type: "failure", reasons: [{type: "yarn-failed", code}]});
                }
            })
    );
}
