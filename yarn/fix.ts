import {mapFailureFn, Result} from "../result/result";
import {yarn} from "./yarn";

export type YarnFixResult = Result<YarnFixFailureReason>;

export interface YarnFixFailureReason {
    readonly type: "yarn-fix-failed";
}

export async function yarnFix(dir: string): Promise<YarnFixResult> {
    return yarn(dir, "fix").then(
        mapFailureFn((): YarnFixFailureReason => ({type: "yarn-fix-failed"}))
    );
}
