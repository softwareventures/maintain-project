import {mapFailureFn, Result} from "../../result/result";
import {yarn} from "./yarn";

export type YarnInstallResult = Result<YarnInstallFailureReason>;

export interface YarnInstallFailureReason {
    readonly type: "yarn-install-failed";
}

export async function yarnInstall(dir: string): Promise<YarnInstallResult> {
    return yarn(dir).then(mapFailureFn(() => ({type: "yarn-install-failed"})));
}
