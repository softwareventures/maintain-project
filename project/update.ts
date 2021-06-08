import simpleGit, {SimpleGit} from "simple-git";
import chain from "@softwareventures/chain";
import {concat} from "@softwareventures/array";
import {FsStage, InsertResult} from "../fs-stage/fs-stage";
import {
    bindAsyncResultFn,
    combineAsyncResults,
    failure,
    mapAsyncResultFn,
    mapFailureFn,
    mapResultFn,
    Result,
    success
} from "../result/result";
import {emptyDirectory} from "../fs-stage/directory";
import {updateCopyrightYear} from "../license/update-copyright-year";
import {commit, CommitFailureReason} from "../fs-stage/commit";
import {excludeNull, mapFn} from "../collections/async-iterable";
import {Project} from "./project";

export interface Update {
    readonly log: string;
    readonly apply: (stage: FsStage) => Promise<InsertResult>;
}

export type UpdateResult = Result<UpdateFailureReason>;

export type UpdateFailureReason = GitNotClean | CommitFailureReason;

export async function updateProject(project: Project): Promise<UpdateResult> {
    const git = simpleGit(project.path);

    return chain([updateCopyrightYear(project)])
        .map(excludeNull)
        .map(mapFn(step(project, git)))
        .map(combineAsyncResults).value;
}

export interface GitNotClean {
    readonly type: "git-not-clean";
    readonly path: string;
}

export function gitNotClean(path: string): GitNotClean {
    return {type: "git-not-clean", path};
}

function step(project: Project, git: SimpleGit): (update: Update) => Promise<UpdateResult> {
    return async update =>
        git
            .status()
            .then(status => (status.isClean() ? success() : failure([gitNotClean(project.path)])))
            .then(mapResultFn(() => console.log(`Applying update: ${update.log}`)))
            .then(
                bindAsyncResultFn(async () =>
                    update.apply({root: emptyDirectory, overwrite: true}).then(
                        mapFailureFn(failure => {
                            console.error(
                                `Error: Internal error creating update file stage: ${JSON.stringify(
                                    failure
                                )}`
                            );
                            throw new Error("Internal error updating project");
                        })
                    )
                )
            )
            .then(
                bindAsyncResultFn<GitNotClean, CommitFailureReason, FsStage, void>(async stage =>
                    commit(project.path, stage)
                )
            )
            .then(mapAsyncResultFn(async () => git.status()))
            .then(mapResultFn(status => concat([status.modified, status.not_added])))
            .then(
                mapAsyncResultFn(async files =>
                    files.length === 0
                        ? undefined
                        : git.add(files).then(async () => git.commit(update.log))
                )
            )
            .then(mapResultFn(() => undefined));
}
