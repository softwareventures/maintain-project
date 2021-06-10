import {resolve} from "path";
import {mapFn} from "@softwareventures/array";
import {ProjectSource} from "../project/project";
import {combineAsyncResults, mapFailureFn, Result, success} from "../result/result";
import {yarn} from "../yarn/yarn";
import {readProjectScript} from "../project/read-script";
import {isPrettierProject} from "./is-prettier-project";

export type PrettierFixResult = Result<PrettierFixFailureReason>;

export interface PrettierFixFailureReason {
    readonly type: "prettier-fix-failed";
    readonly path: string;
}

export async function prettierFixFiles(
    project: ProjectSource,
    relativePaths: readonly string[]
): Promise<PrettierFixResult> {
    return Promise.resolve(relativePaths)
        .then(
            mapFn(async path =>
                yarn(project.path, "prettier", "--write", path).then(
                    mapFailureFn(
                        (): PrettierFixFailureReason => ({
                            type: "prettier-fix-failed",
                            path: resolve(project.path, path)
                        })
                    )
                )
            )
        )
        .then(combineAsyncResults);
}

export async function prettierFixFilesIfAvailable(
    project: ProjectSource,
    relativePaths: readonly string[]
): Promise<PrettierFixResult> {
    return canYarnRunPrettier(project).then(async available =>
        available ? prettierFixFiles(project, relativePaths) : success()
    );
}

async function canYarnRunPrettier(project: ProjectSource): Promise<boolean> {
    return Promise.all([isPrettierProject(project), readProjectScript(project, "prettier")]).then(
        ([hasDependency, script]) =>
            hasDependency && (script == null || script.trim() === "prettier")
    );
}
