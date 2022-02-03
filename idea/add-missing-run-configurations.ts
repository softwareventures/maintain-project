import {mapNullableFn} from "@softwareventures/nullable";
import {excludeNull, only} from "@softwareventures/array";
import {Project} from "../project/project";
import {FsStageUpdate} from "../project/update";
import {readProjectScript} from "../npm/read-script";
import {chainAsyncResults} from "../result/result";
import {readProjectRunConfiguration} from "./read-run-configuration";
import {
    writeIdeaRunConfigurationFix,
    writeIdeaRunConfigurationLint,
    writeIdeaRunConfigurationStart,
    writeIdeaRunConfigurationTest
} from "./write-run-configurations";

export async function addMissingIdeaRunConfigurations(
    project: Project
): Promise<FsStageUpdate | null> {
    const lintScript = readProjectScript(project, "lint");
    const fixScript = readProjectScript(project, "fix");
    const testScript = readProjectScript(project, "test");
    const startScript = readProjectScript(project, "start");

    const missingLintRunConfiguration = readProjectRunConfiguration(project, "lint").then(
        result => result.type === "failure" && only(result.reasons)?.type === "file-not-found"
    );
    const missingFixRunConfiguration = readProjectRunConfiguration(project, "fix").then(
        result => result.type === "failure" && only(result.reasons)?.type === "file-not-found"
    );
    const missingTestRunConfiguration = readProjectRunConfiguration(project, "test").then(
        result => result.type === "failure" && only(result.reasons)?.type === "file-not-found"
    );
    const missingStartRunConfiguration = readProjectRunConfiguration(project, "start").then(
        result => result.type === "failure" && only(result.reasons)?.type === "file-not-found"
    );

    const needLintRunConfiguration = Promise.all([lintScript, missingLintRunConfiguration]).then(
        ([script, missing]) => script != null && missing
    );
    const needFixRunConfiguration = Promise.all([fixScript, missingFixRunConfiguration]).then(
        ([script, missing]) => script != null && missing
    );
    const needTestRunConfiguration = Promise.all([testScript, missingTestRunConfiguration]).then(
        ([script, missing]) => script != null && missing
    );
    const needStartRunConfiguration = Promise.all([startScript, missingStartRunConfiguration]).then(
        ([script, missing]) => script != null && missing
    );

    const insertLintRunConfiguration = needLintRunConfiguration.then(need =>
        need ? writeIdeaRunConfigurationLint(project) : null
    );
    const insertFixRunConfiguration = needFixRunConfiguration.then(need =>
        need ? writeIdeaRunConfigurationFix(project) : null
    );
    const insertTestRunConfiguration = needTestRunConfiguration.then(need =>
        need ? writeIdeaRunConfigurationTest(project) : null
    );
    const insertStartRunConfiguration = needStartRunConfiguration.then(need =>
        need ? writeIdeaRunConfigurationStart(project) : null
    );

    return Promise.all([
        insertLintRunConfiguration,
        insertFixRunConfiguration,
        insertTestRunConfiguration,
        insertStartRunConfiguration
    ])
        .then(excludeNull)
        .then(actions => (actions.length === 0 ? null : actions))
        .then(
            mapNullableFn(actions => ({
                type: "fs-stage-update",
                log: "chore(webstorm): add missing run configurations",
                apply: async stage => chainAsyncResults(stage, actions)
            }))
        );
}
