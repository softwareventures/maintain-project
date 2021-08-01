import {last} from "@softwareventures/array";
import {mapNullable, mapNullableFn, notNull} from "@softwareventures/nullable";
import {FsStageUpdate} from "../project/update";
import {readProjectYamlAsDocument} from "../project/read-yaml";
import {Project} from "../project/project";
import {
    allAsyncResults,
    bindAsyncResultFn,
    mapResultFn,
    success,
    toAsyncNullable
} from "../result/result";
import {looseSort} from "../semver/loose-sort";
import {noneNull} from "../collections/arrays";
import {textFile} from "../fs-stage/file";
import {insert} from "../fs-stage/fs-stage";

export async function useLatestNodeToMaintain(project: Project): Promise<FsStageUpdate | null> {
    const workflow = readProjectYamlAsDocument(project, ".github/workflows/maintain-project.yml");
    const oldVersion = workflow
        .then(mapResultFn(workflow => workflow.getIn(["env", "NODE_VERSION"])))
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
                        workflow.setIn(["env", "NODE_VERSION"], newVersion);
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
            log: `ci(github): use node ${notNull(newVersion)} in maintain-project workflow`,
            apply: async stage => insert(stage, ".github/workflows/maintain-project.yml", file)
        }))
    );
}
