import type {Result} from "../result/result.js";
import {mapFailureFn, success} from "../result/result.js";
import type {ProjectSource} from "../project/project.js";
import {readProjectScript} from "../npm/read-script.js";
import {yarn} from "./yarn.js";

export type YarnFixResult = Result<YarnFixFailureReason>;

export interface YarnFixFailureReason {
    readonly type: "yarn-fix-failed";
    readonly path: string;
}

export async function yarnFix(project: ProjectSource): Promise<YarnFixResult> {
    return yarn(project, "fix").then(
        mapFailureFn((): YarnFixFailureReason => ({type: "yarn-fix-failed", path: project.path}))
    );
}

export async function yarnFixIfAvailable(project: ProjectSource): Promise<YarnFixResult> {
    return isYarnFixAvailable(project).then(async available =>
        available ? yarnFix(project) : success()
    );
}

export async function isYarnFixAvailable(project: ProjectSource): Promise<boolean> {
    return readProjectScript(project, "fix").then(script => script != null);
}
