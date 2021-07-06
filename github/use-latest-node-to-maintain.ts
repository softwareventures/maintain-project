import {last} from "@softwareventures/array";
import {mapNullableFn} from "@softwareventures/nullable";
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
    const newVersion = oldVersion
        .then(mapResultFn(mapNullableFn(() => last(looseSort(project.node.currentReleases)))))
        .then(mapResultFn(mapNullableFn(version => `${version}.x`)));
    const resultWorkflow = allAsyncResults([workflow, newVersion])
        .then(mapResultFn(noneNull))
        .then(
            mapResultFn(
                mapNullableFn(([workflow, newVersion]) => {
                    workflow.setIn(["env", "NODE_VERSION"], newVersion);
                    return workflow;
                })
            )
        );
    const file = resultWorkflow.then(
        bindAsyncResultFn(async workflow =>
            workflow == null ? success(null) : success(textFile(String(workflow)))
        )
    );

    return toAsyncNullable(allAsyncResults([newVersion, file]))
        .then(mapNullableFn(noneNull))
        .then(
            mapNullableFn(([newVersion, file]) => ({
                type: "fs-stage-update",
                log: `ci(github): use node ${newVersion} in maintain-project workflow`,
                apply: async stage => insert(stage, ".github/workflows/maintain-project.yml", file)
            }))
        );
}
