import {fork} from "child_process";
import {YarnResult} from "../../task/result";

export async function yarn(dir: string, ...args: string[]): Promise<YarnResult> {
    return new Promise((resolve, reject) =>
        fork(require.resolve("yarn/bin/yarn.js"), args, {cwd: dir, stdio: "inherit"})
            .on("error", reject)
            .on("exit", code => {
                if (code === 0) {
                    resolve({type: "success"});
                } else {
                    resolve({type: "yarn-failed"});
                }
            })
    );
}
