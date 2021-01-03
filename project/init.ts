import {commit, CommitFailureReason} from "../fs-changeset/commit";
import {emptyDirectory} from "../fs-changeset/directory";
import {FsChangeset} from "../fs-changeset/fs-changeset";
import {bindAsyncResultFn, chainAsyncResults, mapFailureFn, Result} from "../result/result";
import {writeEsLintIgnore} from "./eslint/write";
import {gitInit} from "./git/init";
import {writeGitIgnore} from "./git/write";
import {writeGitHubConfig} from "./github/write";
import {writeIdeaProjectFiles} from "./idea/write";
import {writeNpmFiles} from "./npm/write";
import {writePrettierIgnore} from "./prettier/write";
import {Project} from "./project";
import {writeRenovateConfig} from "./renovate/write";
import {writeTypeScriptFiles} from "./typescript/write";
import {writeWebpackConfig} from "./webpack/write";
import {yarnFix, YarnFixFailureReason} from "./yarn/fix";
import {yarnInstall, YarnInstallFailureReason} from "./yarn/install";

export type InitResult = Result<InitFailureReason>;

export type InitFailureReason =
    | CommitFailureReason
    | YarnInstallFailureReason
    | YarnFixFailureReason;

export default async function init(project: Project): Promise<InitResult> {
    const fsChangeset: FsChangeset = {
        root: emptyDirectory,
        overwrite: false
    };

    return chainAsyncResults(fsChangeset, [
        writeGitHubConfig,
        writeRenovateConfig(project),
        writePrettierIgnore(project),
        writeGitIgnore(project),
        writeEsLintIgnore(project),
        writeTypeScriptFiles(project),
        writeWebpackConfig(project),
        writeIdeaProjectFiles(project),
        writeNpmFiles(project),
        gitInit
    ])
        .then(
            mapFailureFn(() => {
                throw new Error("Internal error initializing project");
            })
        )
        .then(bindAsyncResultFn(async fsChangeset => commit(project.path, fsChangeset)))
        .then(
            bindAsyncResultFn<InitFailureReason>(async () => yarnInstall(project.path))
        )
        .then(
            bindAsyncResultFn<InitFailureReason>(async () => yarnFix(project.path))
        );
}
