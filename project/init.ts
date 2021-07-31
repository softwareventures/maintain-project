import {commit, CommitFailureReason} from "../fs-stage/commit";
import {emptyDirectory} from "../fs-stage/directory";
import {FsStage} from "../fs-stage/fs-stage";
import {bindAsyncResultFn, chainAsyncResults, Result, throwFailureFn} from "../result/result";
import {writeEsLintIgnore} from "../eslint/write";
import {gitInit} from "../git/init";
import {writeGitIgnore} from "../git/write";
import {writeGitHubConfig} from "../github/write";
import {writeIdeaProjectFiles} from "../idea/write";
import {writeNpmFiles} from "../npm/write";
import {writePrettierIgnore} from "../prettier/write";
import {writeRenovateConfig} from "../renovate/write";
import {writeTypeScriptFiles} from "../typescript/write";
import {writeWebpackConfig} from "../webpack/write";
import {yarnFix, YarnFixFailureReason} from "../yarn/fix";
import {yarnInstall, YarnInstallFailureReason} from "../yarn/install";
import {writeLicense} from "../license/write";
import {Project} from "./project";

export type InitResult = Result<InitFailureReason>;

export type InitFailureReason =
    | CommitFailureReason
    | YarnInstallFailureReason
    | YarnFixFailureReason;

export default async function init(project: Project): Promise<InitResult> {
    const fsStage: FsStage = {
        root: emptyDirectory,
        overwrite: false
    };

    return chainAsyncResults(fsStage, [
        writeGitHubConfig,
        writeRenovateConfig(project),
        writePrettierIgnore(project),
        writeGitIgnore(project),
        writeEsLintIgnore(project),
        writeTypeScriptFiles(project),
        writeWebpackConfig(project),
        writeIdeaProjectFiles(project),
        writeNpmFiles(project),
        writeLicense(project),
        gitInit
    ])
        .then(throwFailureFn("Internal error creating initial file stage"))
        .then(async fsStage => commit(project.path, fsStage))
        .then(bindAsyncResultFn<InitFailureReason>(async () => yarnInstall(project)))
        .then(bindAsyncResultFn<InitFailureReason>(async () => yarnFix(project)));
}
