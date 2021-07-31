import {mapFailureFn, Result} from "../result/result";
import {ProjectSource} from "../project/project";
import {yarn} from "./yarn";

export type YarnInstallResult = Result<YarnInstallFailureReason>;

export interface YarnInstallFailureReason {
    readonly type: "yarn-install-failed";
}

export async function yarnInstall(project: ProjectSource): Promise<YarnInstallResult> {
    return yarn(project).then(
        mapFailureFn((): YarnInstallFailureReason => ({type: "yarn-install-failed"}))
    );
}
