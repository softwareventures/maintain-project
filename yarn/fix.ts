import {mapNullFn} from "@softwareventures/nullable";
import {mapFailureFn, mapResultFn, Result, success, toNullable} from "../result/result";
import {ProjectSource} from "../project/project";
import {readProjectJson} from "../project/read-json";
import {yarn} from "./yarn";

export type YarnFixResult = Result<YarnFixFailureReason>;

export interface YarnFixFailureReason {
    readonly type: "yarn-fix-failed";
    readonly path: string;
}

export async function yarnFix(dir: string): Promise<YarnFixResult> {
    return yarn(dir, "fix").then(
        mapFailureFn((): YarnFixFailureReason => ({type: "yarn-fix-failed", path: dir}))
    );
}

export async function yarnFixIfAvailable(project: ProjectSource): Promise<YarnFixResult> {
    return isYarnFixAvailable(project).then(async available =>
        available ? yarnFix(project.path) : success()
    );
}

export async function isYarnFixAvailable(project: ProjectSource): Promise<boolean> {
    return readProjectJson(project, "package.json")
        .then(
            mapResultFn(
                packageJson =>
                    typeof packageJson === "object" &&
                    typeof packageJson?.scripts === "object" &&
                    typeof packageJson?.scripts?.fix === "string"
            )
        )
        .then(toNullable)
        .then(mapNullFn(() => false));
}
