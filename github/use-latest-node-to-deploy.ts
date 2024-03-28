import {mapNullable, mapNullableFn, notNull} from "@softwareventures/nullable";
import {last, noneNull} from "@softwareventures/array";
import type {Project} from "../project/project.js";
import type {FsStageUpdate} from "../project/update.js";
import {readProjectYamlAsDocument} from "../project/read-yaml.js";
import {
    allAsyncResults,
    bindAsyncResultFn,
    mapResultFn,
    success,
    toAsyncNullable
} from "../result/result.js";
import {looseSort} from "../semver/loose-sort.js";
import {textFile} from "../fs-stage/file.js";
import {insert} from "../fs-stage/fs-stage.js";

export async function useLatestNodeToDeploy(project: Project): Promise<FsStageUpdate | null> {
    const workflow = readProjectYamlAsDocument(project, ".github/workflows/ci.yml");
    const oldVersion = workflow
        .then(mapResultFn(workflow => workflow.getIn(["env", "DEPLOY_NODE_VERSION"]) as unknown))
        .then(mapResultFn(mapNullableFn(String)));
    const newVersion = mapNullable(
        last(looseSort(project.node.currentReleases)),
        version => `${version}.x`
    );
    const resultWorkflow = allAsyncResults([workflow, oldVersion])
        .then(mapResultFn(noneNull))
        .then(
            mapResultFn(
                mapNullableFn(([workflow, oldVersion]) => {
                    if (oldVersion !== newVersion) {
                        workflow.setIn(["env", "DEPLOY_NODE_VERSION"], newVersion);
                        return workflow;
                    } else {
                        return null;
                    }
                })
            )
        );
    const file = resultWorkflow.then(
        bindAsyncResultFn(async workflow =>
            workflow == null ? success(null) : success(textFile(String(workflow)))
        )
    );

    return toAsyncNullable(file).then(
        mapNullableFn(file => ({
            type: "fs-stage-update",
            log: `ci(github): deploy using node ${notNull(newVersion)}`,
            apply: async stage => insert(stage, ".github/workflows/ci.yml", file)
        }))
    );
}
