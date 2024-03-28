import type {CommitFailureReason} from "../fs-stage/commit.js";
import {commit} from "../fs-stage/commit.js";
import {emptyDirectory} from "../fs-stage/directory.js";
import type {FsStage} from "../fs-stage/fs-stage.js";
import type {Result} from "../result/result.js";
import {bindAsyncResultFn, chainAsyncResults, throwFailureFn} from "../result/result.js";
import {writeEsLintIgnore} from "../eslint/write.js";
import type {GitInitFailureReason} from "../git/init.js";
import {gitInit} from "../git/init.js";
import {writeGitIgnore} from "../git/write.js";
import {writeGitHubConfig} from "../github/write.js";
import {writeIdeaProjectFiles} from "../idea/write.js";
import {writeNpmFiles} from "../npm/write.js";
import {writePrettierIgnore} from "../prettier/write.js";
import {writeRenovateConfig} from "../renovate/write.js";
import {writeTypeScriptFiles} from "../typescript/write.js";
import {writeWebpackConfig} from "../webpack/write.js";
import type {YarnFixFailureReason} from "../yarn/fix.js";
import {yarnFix} from "../yarn/fix.js";
import type {YarnInstallFailureReason} from "../yarn/install.js";
import {yarnInstall} from "../yarn/install.js";
import {writeLicense} from "../license/write.js";
import {writeHuskyConfig} from "../husky/write.js";
import {writeCommitlintConfig} from "../commitlint/write.js";
import type {YarnSetVersionFailureReason} from "../yarn/set-version-stable.js";
import {yarnSetVersionStable} from "../yarn/set-version-stable.js";
import type {SetYarnLinkerFailureReason} from "../yarn/set-linker-to-node-modules.js";
import {setYarnLinkerToNodeModules} from "../yarn/set-linker-to-node-modules.js";
import type {Project} from "./project.js";

export type InitResult = Result<InitFailureReason>;

export type InitFailureReason =
    | CommitFailureReason
    | GitInitFailureReason
    | YarnSetVersionFailureReason
    | SetYarnLinkerFailureReason
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
        .then(bindAsyncResultFn<InitFailureReason>(async () => yarnSetVersionStable(project)))
        .then(bindAsyncResultFn<InitFailureReason>(async () => setYarnLinkerToNodeModules(project)))
        .then(bindAsyncResultFn<InitFailureReason>(async () => yarnInstall(project)))
        .then(bindAsyncResultFn<InitFailureReason>(async () => yarnFix(project)));
}
