import type {Result} from "../result/result";
import {mapFailureFn, success} from "../result/result";
import type {ProjectSource} from "../project/project";
import {readProjectScript} from "../npm/read-script";
import {yarn} from "./yarn";

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
