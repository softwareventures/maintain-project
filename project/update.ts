import simpleGit, {SimpleGit} from "simple-git";
import chain from "@softwareventures/chain";
import {concat} from "@softwareventures/array";
import {mapFn as mapAsyncFn} from "../collections/async-iterable";
import {FsStage, InsertResult} from "../fs-stage/fs-stage";
import {
    bindAsyncResultFn,
    combineAsyncResults,
    failure,
    mapAsyncResultFn,
    mapResultFn,
    Result,
    success,
    throwFailureFn
} from "../result/result";
import {emptyDirectory} from "../fs-stage/directory";
import {updateCopyrightYear} from "../license/update-copyright-year";
import {commit, CommitFailureReason} from "../fs-stage/commit";
import {addMissingLicense} from "../license/add-missing-license";
import {YarnFixFailureReason} from "../yarn/fix";
import {applyCodeStyle} from "../yarn/apply-code-style";
import {PrettierFixFailureReason, prettierFixFilesIfAvailable} from "../prettier/fix";
import {updateFixScript} from "../npm/update-fix-script";
import {Project} from "./project";

export type Update = FsStageUpdate | DirectUpdate;

export interface FsStageUpdate {
    readonly type: "fs-stage-update";
    readonly log: string;
    readonly apply: (stage: FsStage) => Promise<InsertResult>;
}

export interface DirectUpdate {
    readonly type: "direct-update";
    readonly log: string;
    readonly apply: () => Promise<Result<UpdateStepFailureReason>>;
}

export type UpdateResult = Result<UpdateFailureReason>;

export type UpdateFailureReason = GitNotClean | CommitFailureReason | UpdateStepFailureReason;

export type UpdateStepFailureReason = YarnFixFailureReason | PrettierFixFailureReason;

export async function updateProject(project: Project): Promise<UpdateResult> {
    const git = simpleGit(project.path);

    return chain([updateFixScript, applyCodeStyle, updateCopyrightYear, addMissingLicense])
        .map(mapAsyncFn(step(project, git)))
        .map(combineAsyncResults).value;
}

export interface GitNotClean {
    readonly type: "git-not-clean";
    readonly path: string;
}

export function gitNotClean(path: string): GitNotClean {
    return {type: "git-not-clean", path};
}

function step(
    project: Project,
    git: SimpleGit
): (update: (project: Project) => Promise<Update | null>) => Promise<UpdateResult> {
    return async update =>
        git
            .status()
            .then(status => (status.isClean() ? success() : failure([gitNotClean(project.path)])))
            .then(mapAsyncResultFn(async () => update(project)))
            .then(bindAsyncResultFn(async update => commitUpdate(project, git, update)));
}

async function commitUpdate(
    project: Project,
    git: SimpleGit,
    update: Update | null
): Promise<UpdateResult> {
    if (update == null) {
        return success();
    }

    return writeUpdate(project, update)
        .then(mapAsyncResultFn(async () => git.status()))
        .then(mapResultFn(status => concat([status.modified, status.not_added])))
        .then(
            bindAsyncResultFn(async files =>
                prettierFixFilesIfAvailable(project, files).then(mapResultFn(() => files))
            )
        )
        .then(
            mapAsyncResultFn(async files =>
                files.length === 0
                    ? undefined
                    : git.add(files).then(async () => git.commit(update.log))
            )
        )
        .then(
            mapResultFn(commitResult => {
                if (commitResult != null) {
                    console.log(`Applied update: ${update.log}`);
                }
            })
        );
}

async function writeUpdate(project: Project, update: Update): Promise<UpdateResult> {
    switch (update.type) {
        case "fs-stage-update":
            return update
                .apply({root: emptyDirectory, overwrite: true})
                .then(throwFailureFn("Internal error creating update file stage"))
                .then(async stage => commit(project.path, stage));
        case "direct-update":
            return update.apply();
    }
}
