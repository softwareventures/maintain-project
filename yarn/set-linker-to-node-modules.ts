import type {ProjectSource} from "../project/project.js";
import type {Result} from "../result/result.js";
import {mapFailureFn} from "../result/result.js";
import {yarn} from "./yarn.js";

export type SetYarnLinkerResult = Result<SetYarnLinkerFailureReason>;

export interface SetYarnLinkerFailureReason {
    readonly type: "set-yarn-linker-failed";
}

export async function setYarnLinkerToNodeModules(
    project: ProjectSource
): Promise<SetYarnLinkerResult> {
    return yarn(project, "config", "set", "nodeLinker", "node-modules").then(
        mapFailureFn(() => ({type: "set-yarn-linker-failed"}) as const)
    );
}
