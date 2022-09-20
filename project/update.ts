import type {SimpleGit} from "simple-git";
import simpleGit from "simple-git";
import {concat, map} from "@softwareventures/array";
import wrap = require("wordwrap");
import type {FsStage, InsertResult} from "../fs-stage/fs-stage";
import type {Result} from "../result/result";
import {
    bindAsyncResultFn,
    failure,
    mapAsyncResultFn,
    mapResultFn,
    success,
    throwFailureFn,
    tolerantFoldAsyncResultsFn
} from "../result/result";
import {emptyDirectory} from "../fs-stage/directory";
import {updateCopyrightYear} from "../license/update-copyright-year";
import type {CommitFailureReason} from "../fs-stage/commit";
import {commit} from "../fs-stage/commit";
import {addMissingLicense} from "../license/add-missing-license";
import type {YarnFixFailureReason} from "../yarn/fix";
import {applyCodeStyle} from "../yarn/apply-code-style";
import type {PrettierFixFailureReason} from "../prettier/fix";
import {prettierFixFilesIfAvailable} from "../prettier/fix";
import {updateFixScript} from "../npm/update-fix-script";
import {updateLintScript} from "../npm/update-lint-script";
import {addNewNodeVersionsToPackageJson} from "../npm/add-new-node-versions";
import {addMissingNodeVersionsToGitHubActions} from "../github/add-missing-node-versions";
import {applyCodeStyleToPackageJson} from "../npm/apply-code-style";
import {useLatestNodeToDeploy} from "../github/use-latest-node-to-deploy";
import {useLatestNodeToMaintain} from "../github/use-latest-node-to-maintain";
import {dropOldNodeVersions} from "../node/drop-old-versions";
import {removeUnsupportedNodeVersions} from "../github/remove-unsupported-node-versions";
import {removeTslintFromTestScript} from "../npm/remove-tslint-from-test-script";
import {addYarnLintToCiWorkflow} from "../github/add-yarn-lint-to-ci-workflow";
import {addMissingIdeaRunConfigurations} from "../idea/add-missing-run-configurations";
import {enableDisableIdeaTslintInspection} from "../idea/enable-disable-tslint";
import {enableDisableIdeaEslintInspection} from "../idea/enable-disable-eslint";
import type {Project} from "./project";

export type Update = FsStageUpdate | DirectUpdate;

export interface FsStageUpdate {
    readonly type: "fs-stage-update";
    readonly log: string;
    readonly breaking?: readonly string[] | undefined;
    readonly apply: (stage: FsStage) => Promise<InsertResult>;
    readonly updatedProject?: Project | undefined;
}

export interface DirectUpdate {
    readonly type: "direct-update";
    readonly log: string;
    readonly breaking?: readonly string[] | undefined;
    readonly apply: () => Promise<Result<UpdateStepFailureReason>>;
    readonly updatedProject?: Project | undefined;
}

export type UpdateResult = Result<UpdateFailureReason, Project>;

export type UpdateFailureReason = GitNotClean | CommitFailureReason | UpdateStepFailureReason;

export type UpdateStepFailureReason = YarnFixFailureReason | PrettierFixFailureReason;

export interface UpdateProjectOptions {
    readonly project: Project;
    readonly breaking?: boolean | undefined;
}

export async function updateProject(options: UpdateProjectOptions): Promise<UpdateResult> {
    const git = simpleGit(options.project.path);

    return Promise.resolve([
        applyCodeStyleToPackageJson,
        updateLintScript,
        updateFixScript,
        addYarnLintToCiWorkflow,
        removeTslintFromTestScript,
        enableDisableIdeaTslintInspection,
        enableDisableIdeaEslintInspection,
        applyCodeStyle,
        updateCopyrightYear,
        addMissingLicense,
        removeUnsupportedNodeVersions,
        dropOldNodeVersions,
        addNewNodeVersionsToPackageJson,
        addMissingNodeVersionsToGitHubActions,
        useLatestNodeToDeploy,
        useLatestNodeToMaintain,
        addMissingIdeaRunConfigurations
    ]).then(
        tolerantFoldAsyncResultsFn(
            async (project, update) => step({...options, project, git, update}),
            options.project
        )
    );
}

export interface GitNotClean {
    readonly type: "git-not-clean";
    readonly path: string;
}

export function gitNotClean(path: string): GitNotClean {
    return {type: "git-not-clean", path};
}

interface StepOptions extends UpdateProjectOptions {
    readonly git: SimpleGit;
    readonly update: (project: Project) => Promise<Update | null>;
}

async function step({project, breaking, git, update}: StepOptions): Promise<UpdateResult> {
    return git
        .status()
        .then(status => (status.isClean() ? success() : failure([gitNotClean(project.path)])))
        .then(mapAsyncResultFn(async () => update(project)))
        .then(
            mapAsyncResultFn(async update =>
                (breaking ?? false) || (update?.breaking?.length ?? 0) === 0 ? update : null
            )
        )
        .then(bindAsyncResultFn(async update => commitUpdate(project, git, update)));
}

async function commitUpdate(
    project: Project,
    git: SimpleGit,
    update: Update | null
): Promise<UpdateResult> {
    if (update == null) {
        return success(project);
    }

    return writeUpdate(project, update)
        .then(mapAsyncResultFn(async () => git.status()))
        .then(mapResultFn(status => concat([status.modified, status.not_added])))
        .then(
            bindAsyncResultFn(
                async files =>
                    prettierFixFilesIfAvailable(project, files).then(() => success(files)) // Ignore failure
            )
        )
        .then(mapAsyncResultFn(async () => git.status()))
        .then(mapResultFn(status => concat([status.modified, status.not_added])))
        .then(
            mapAsyncResultFn(async files =>
                files.length === 0
                    ? undefined
                    : git
                          .add(files)
                          .then(async () =>
                              git.commit(generateCommitLog(update), {"--no-verify": null})
                          )
            )
        )
        .then(
            mapResultFn(commitResult => {
                if (commitResult != null && commitResult.commit !== "") {
                    console.log(`Applied update: ${update.log}`);
                    return update.updatedProject ?? project;
                } else {
                    return project;
                }
            })
        );
}

function generateCommitLog(update: Update): string {
    return (
        update.log +
        map(update.breaking ?? [], breaking => wrap(62)(`\n\nBREAKING CHANGE: ${breaking}`)).join(
            ""
        )
    );
}

type WriteUpdateResult = Result<UpdateFailureReason>;

async function writeUpdate(project: Project, update: Update): Promise<WriteUpdateResult> {
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
