import {simpleGit} from "simple-git";
import type {Result} from "../result/result.js";
import {failure, success} from "../result/result.js";
import type {ProjectSource} from "../project/project.js";

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
