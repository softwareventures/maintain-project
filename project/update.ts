import type {SimpleGit} from "simple-git";
import {simpleGit} from "simple-git";
import {concat, map} from "@softwareventures/array";
import wrap from "wordwrap";
import type {FsStage, InsertResult} from "../fs-stage/fs-stage.js";
import type {Result} from "../result/result.js";
import {
    bindAsyncResultFn,
    failure,
    mapAsyncResultFn,
    mapResultFn,
    success,
    throwFailureFn,
    tolerantFoldAsyncResultsFn
} from "../result/result.js";
import {emptyDirectory} from "../fs-stage/directory.js";
import {updateCopyrightYear} from "../license/update-copyright-year.js";
import type {CommitFailureReason} from "../fs-stage/commit.js";
import {commit} from "../fs-stage/commit.js";
import {addMissingLicense} from "../license/add-missing-license.js";
import type {YarnFixFailureReason} from "../yarn/fix.js";
import {applyCodeStyle} from "../yarn/apply-code-style.js";
import type {PrettierFixFailureReason} from "../prettier/fix.js";
import {prettierFixFilesIfAvailable} from "../prettier/fix.js";
import {updateFixScript} from "../npm/update-fix-script.js";
import {updateLintScript} from "../npm/update-lint-script.js";
import {addNewNodeVersionsToPackageJson} from "../npm/add-new-node-versions.js";
import {addMissingNodeVersionsToGitHubActions} from "../github/add-missing-node-versions.js";
import {applyCodeStyleToPackageJson} from "../npm/apply-code-style.js";
import {useLatestNodeToDeploy} from "../github/use-latest-node-to-deploy.js";
import {useLatestNodeToMaintain} from "../github/use-latest-node-to-maintain.js";
import {dropOldNodeVersions} from "../node/drop-old-versions.js";
import {removeUnsupportedNodeVersions} from "../github/remove-unsupported-node-versions.js";
import {removeTslintFromTestScript} from "../npm/remove-tslint-from-test-script.js";
import {addYarnLintToCiWorkflow} from "../github/add-yarn-lint-to-ci-workflow.js";
import {addMissingIdeaRunConfigurations} from "../idea/add-missing-run-configurations.js";
import {enableDisableIdeaTslintInspection} from "../idea/enable-disable-tslint.js";
import {enableDisableIdeaEslintInspection} from "../idea/enable-disable-eslint.js";
import type {Project} from "./project.js";

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
