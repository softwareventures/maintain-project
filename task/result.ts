import {filterFn} from "@softwareventures/array";

export interface Success {
    type: "success";
}

export interface NotDirectory {
    type: "not-directory";
}

export interface NotEmpty {
    type: "not-empty";
}

export interface YarnInstallFailed {
    type: "yarn-install-failed";
}

export interface YarnFixFailed {
    type: "yarn-fix-failed";
}

export type Result = Success | NotDirectory | NotEmpty | YarnInstallFailed | YarnFixFailed;

export interface YarnFailed {
    type: "yarn-failed";
}

export type YarnResult = Success | YarnFailed;

export function mapResultFn(f: () => PromiseLike<Result>): (result: Result) => Promise<Result> {
    return async result => (result.type === "success" ? f() : Promise.resolve(result));
}

export async function combineResults(
    results: ReadonlyArray<PromiseLike<Result>>,
    combineErrors = combineErrorsToNotEmpty
): Promise<Result> {
    return Promise.all(results)
        .then(filterFn(result => result.type !== "success"))
        .then(errors => (errors.length > 0 ? combineErrors(errors) : {type: "success"}));
}

async function combineErrorsToNotEmpty(errors: readonly Result[]): Promise<Result> {
    return {type: "not-empty"};
}
