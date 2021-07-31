import simpleGit from "simple-git";
import {failure, Result, success} from "../result/result";
import {ProjectSource} from "../project/project";

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
