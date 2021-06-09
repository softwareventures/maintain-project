import {resolve} from "path";
import {mapFn} from "@softwareventures/array";
import {mapNullFn} from "@softwareventures/nullable";
import {ProjectSource} from "../project/project";
import {readProjectJson} from "../project/read-json";
import {
    combineAsyncResults,
    mapFailureFn,
    mapResultFn,
    Result,
    success,
    toNullable
} from "../result/result";
import {yarn} from "../yarn/yarn";

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
    return isPrettierAvailable(project).then(async available =>
        available ? prettierFixFiles(project, relativePaths) : success()
    );
}

export async function isPrettierAvailable(project: ProjectSource): Promise<boolean> {
    return readProjectJson(project, "package.json")
        .then(
            mapResultFn(
                packageJson =>
                    packageJsonDependsOnPrettier(packageJson) && yarnPrettierCanRun(packageJson)
            )
        )
        .then(toNullable)
        .then(mapNullFn(() => false));
}

function packageJsonDependsOnPrettier(packageJson: any): boolean {
    return (
        typeof packageJson === "object" &&
        ((typeof packageJson?.dependencies === "object" &&
            typeof packageJson?.dependencies?.prettier === "string") ||
            (typeof packageJson?.devDependencies === "object" &&
                typeof packageJson?.devDependencies?.prettier === "string"))
    );
}

function yarnPrettierCanRun(packageJson: any): boolean {
    return (
        typeof packageJson === "object" &&
        (typeof packageJson?.scripts !== "object" ||
            packageJson?.scripts?.prettier == null ||
            String(packageJson?.scripts?.prettier).trim() === "prettier")
    );
}
