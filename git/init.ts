import simpleGit from "simple-git";
import type {Result} from "../result/result";
import {failure, success} from "../result/result";
import type {ProjectSource} from "../project/project";

export type GitInitResult = Result<GitInitFailureReason>;

export interface GitInitFailureReason {
    readonly type: "git-init-failed";
}

export async function gitInit(project: ProjectSource): Promise<GitInitResult> {
    return simpleGit(project.path)
        .init()
        .then(() => success())
        .catch(() => failure([{type: "git-init-failed"}]));
}
