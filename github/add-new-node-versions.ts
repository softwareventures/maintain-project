import {concat, excludeFn, mapFn} from "@softwareventures/array";
import chain from "@softwareventures/chain";
import {mapNullableFn, mapNullFn} from "@softwareventures/nullable";
import {intersects} from "semver";
import {Project} from "../project/project";
import {FsStageUpdate} from "../project/update";
import {readProjectYamlAsDocument} from "../project/read-yaml";
import {
    allAsyncResults,
    bindAsyncResultFn,
    mapResultFn,
    success,
    toAsyncNullable
} from "../result/result";
import {looseLtr} from "../semver/loose-ltr";
import {looseSort} from "../semver/loose-sort";
import {noneNull} from "../collections/arrays";
import {insert} from "../fs-stage/fs-stage";
import {textFile} from "../fs-stage/file";

export async function addNewNodeVersionsToGitHubActions(
    project: Project
): Promise<FsStageUpdate | null> {
    const workflow = readProjectYamlAsDocument(project, ".github/workflows/ci.yml");
    const oldVersions = workflow
        .then(
            mapResultFn(
                workflow =>
                    workflow.getIn(["jobs", "build-and-test", "strategy", "matrix", "node-version"])
                        ?.items
            )
        )
        .then(mapResultFn(mapNullableFn(mapFn(String))))
        .then(mapResultFn(mapNullFn(() => [] as string[])));
    const oldVersionRange = oldVersions
        .then(mapResultFn(versions => versions.join(" || ")))
        .then(mapResultFn(versions => (versions.length === 0 ? null : versions)));
    const newVersions = oldVersionRange
        .then(
            mapResultFn(
                mapNullableFn(
                    range =>
                        chain(project.node.currentReleases)
                            .map(excludeFn(release => intersects(range, `^${release}`)))
                            .map(excludeFn(release => looseLtr(release, range))).value
                )
            )
        )
        .then(mapResultFn(mapNullableFn(mapFn(version => `${version}.x`))))
        .then(mapResultFn(mapNullableFn(versions => (versions.length === 0 ? null : versions))));
    const resultVersions = allAsyncResults([oldVersions, newVersions])
        .then(mapResultFn(noneNull))
        .then(mapResultFn(mapNullableFn(concat)))
        .then(mapResultFn(mapNullableFn(looseSort)));
    const resultWorkflow = allAsyncResults([workflow, resultVersions])
        .then(mapResultFn(noneNull))
        .then(
            mapResultFn(
                mapNullableFn(([workflow, resultVersions]) => {
                    workflow.getIn([
                        "jobs",
                        "build-and-test",
                        "strategy",
                        "matrix",
                        "node-version"
                    ]).items = resultVersions;
                    return workflow;
                })
            )
        );
    const file = resultWorkflow.then(
        bindAsyncResultFn(async workflow =>
            workflow == null ? success(null) : success(textFile(String(workflow)))
        )
    );

    return toAsyncNullable(allAsyncResults([newVersions, file]))
        .then(mapNullableFn(noneNull))
        .then(
            mapNullableFn(([newVersions, file]) => ({
                type: "fs-stage-update",
                log: `ci(github): add node version${
                    newVersions.length > 1 ? "s" : ""
                } ${newVersions.join(" || ")} to CI workflow`,
                apply: async stage => insert(stage, ".github/workflows/ci.yml", file)
            }))
        );
}
