import type {Result} from "../result/result";
import {mapFailureFn} from "../result/result";
import type {ProjectSource} from "../project/project";
import {yarn} from "./yarn";

export type YarnSetVersionResult = Result<YarnSetVersionFailureReason>;

export interface YarnSetVersionFailureReason {
    readonly type: "yarn-set-version-failed";
}

export async function yarnSetVersionStable(project: ProjectSource): Promise<YarnSetVersionResult> {
    return yarn(project, "set", "version", "stable").then(
        mapFailureFn((): YarnSetVersionFailureReason => ({type: "yarn-set-version-failed"}))
    );
}
