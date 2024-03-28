import {fork} from "child_process";
import {dirname, resolve as resolvePath} from "path";
import {fileURLToPath} from "url";
import type {Result} from "../result/result.js";
import {failure, success} from "../result/result.js";
import type {ProjectSource} from "../project/project.js";

export type YarnResult = Result<YarnFailureReason>;

export interface YarnFailureReason {
    readonly type: "yarn-failed";
    readonly code: number | null;
}

export async function yarn(project: ProjectSource, ...args: string[]): Promise<YarnResult> {
    return new Promise((resolve, reject) => {
        fork(
            resolvePath(
                dirname(fileURLToPath(import.meta.resolve("corepack/package.json"))),
                "dist/corepack.js"
            ),
            ["yarn", ...args],
            {
                cwd: project.path,
                stdio: "ignore",
                env: {COREPACK_ENABLE_DOWNLOAD_PROMPT: "0"}
            }
        )
            .on("error", reject)
            .on("exit", code => {
                if (code === 0) {
                    resolve(success());
                } else {
                    resolve(failure([{type: "yarn-failed", code}]));
                }
            });
    });
}
