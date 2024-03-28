import type {Result} from "../result/result.js";
import {mapFailureFn} from "../result/result.js";
import type {ProjectSource} from "../project/project.js";
import {yarn} from "./yarn.js";

export type YarnInstallResult = Result<YarnInstallFailureReason>;

export interface YarnInstallFailureReason {
    readonly type: "yarn-install-failed";
}

export async function yarnInstall(project: ProjectSource): Promise<YarnInstallResult> {
    return yarn(project).then(
        mapFailureFn((): YarnInstallFailureReason => ({type: "yarn-install-failed"}))
    );
}
