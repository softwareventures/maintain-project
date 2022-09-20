import type {CommitFailureReason} from "../fs-stage/commit";
import {commit} from "../fs-stage/commit";
import {emptyDirectory} from "../fs-stage/directory";
import type {FsStage} from "../fs-stage/fs-stage";
import type {Result} from "../result/result";
import {bindAsyncResultFn, chainAsyncResults, throwFailureFn} from "../result/result";
import {writeEsLintIgnore} from "../eslint/write";
import type {GitInitFailureReason} from "../git/init";
import {gitInit} from "../git/init";
import {writeGitIgnore} from "../git/write";
import {writeGitHubConfig} from "../github/write";
import {writeIdeaProjectFiles} from "../idea/write";
import {writeNpmFiles} from "../npm/write";
import {writePrettierIgnore} from "../prettier/write";
import {writeRenovateConfig} from "../renovate/write";
import {writeTypeScriptFiles} from "../typescript/write";
import {writeWebpackConfig} from "../webpack/write";
import type {YarnFixFailureReason} from "../yarn/fix";
import {yarnFix} from "../yarn/fix";
import type {YarnInstallFailureReason} from "../yarn/install";
import {yarnInstall} from "../yarn/install";
import {writeLicense} from "../license/write";
import {writeHuskyConfig} from "../husky/write";
import {writeCommitlintConfig} from "../commitlint/write";
import type {Project} from "./project";

export type InitResult = Result<InitFailureReason>;

export type InitFailureReason =
    | CommitFailureReason
    | GitInitFailureReason
    | YarnInstallFailureReason
    | YarnFixFailureReason;

export default async function init(project: Project): Promise<InitResult> {
    const fsStage: FsStage = {
        root: emptyDirectory,
        overwrite: false
    };

    return chainAsyncResults(fsStage, [
        writeGitHubConfig(project),
        writeRenovateConfig(project),
        writePrettierIgnore(project),
        writeGitIgnore(project),
        writeEsLintIgnore(project),
        writeHuskyConfig(project),
        writeCommitlintConfig(project),
        writeTypeScriptFiles(project),
        writeWebpackConfig(project),
        writeIdeaProjectFiles(project),
        writeNpmFiles(project),
        writeLicense(project)
    ])
        .then(throwFailureFn("Internal error creating initial file stage"))
        .then(async fsStage => commit(project.path, fsStage))
        .then(bindAsyncResultFn<InitFailureReason>(async () => gitInit(project)))
        .then(bindAsyncResultFn<InitFailureReason>(async () => yarnInstall(project)))
        .then(bindAsyncResultFn<InitFailureReason>(async () => yarnFix(project)));
}
