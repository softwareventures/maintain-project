import type {Result} from "../result/result.js";
import {mapFailureFn} from "../result/result.js";
import type {ProjectSource} from "../project/project.js";
import {yarn} from "./yarn.js";

export type YarnSetVersionResult = Result<YarnSetVersionFailureReason>;

export interface YarnSetVersionFailureReason {
    readonly type: "yarn-set-version-failed";
}

export async function yarnSetVersionStable(project: ProjectSource): Promise<YarnSetVersionResult> {
    return yarn(project, "set", "version", "stable").then(
        mapFailureFn((): YarnSetVersionFailureReason => ({type: "yarn-set-version-failed"}))
    );
}
