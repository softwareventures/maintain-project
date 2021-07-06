import {concat, excludeFn, isArray, map, mapFn} from "@softwareventures/array";
import chain from "@softwareventures/chain";
import {mapNullableFn} from "@softwareventures/nullable";
import {intersects} from "semver";
import {dump, JSON_SCHEMA} from "js-yaml";
import {Project} from "../project/project";
import {FsStageUpdate} from "../project/update";
import {readProjectYaml} from "../project/read-yaml";
import {
    allAsyncResults,
    bindAsyncResultFn,
    mapResultFn,
    success,
    toAsyncNullable
} from "../result/result";
import {looseLtr} from "../semver/loose-ltr";
import {textFile} from "../fs-stage/file";
import {looseSort} from "../semver/loose-sort";
import {noneNull} from "../collections/arrays";
import {insert} from "../fs-stage/fs-stage";

export async function addNewNodeVersionsToGitHubActions(
    project: Project
): Promise<FsStageUpdate | null> {
    const workflow = readProjectYaml(project, ".github/workflows/ci.yml");
    const oldVersions = workflow
        .then(
            mapResultFn(yaml => yaml?.jobs?.["build-and-test"]?.strategy?.matrix?.["node-version"])
        )
        .then(
            mapResultFn(versions =>
                isArray(versions)
                    ? map(versions, String)
                    : typeof versions === "string"
                    ? [versions]
                    : []
            )
        );
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
        .then(mapResultFn(mapNullableFn(mapFn(version => `${version}.x`))));
    const resultVersions = allAsyncResults([oldVersions, newVersions])
        .then(mapResultFn(noneNull))
        .then(mapResultFn(mapNullableFn(concat)))
        .then(mapResultFn(mapNullableFn(looseSort)));
    const file = allAsyncResults([workflow, resultVersions]).then(
        bindAsyncResultFn(async ([workflow, versions]) =>
            versions == null
                ? success(null)
                : success(
                      textFile(
                          dump(
                              {
                                  ...workflow,
                                  jobs: {
                                      ...workflow?.jobs,
                                      ["build-and-test"]: {
                                          ...workflow?.jobs?.["build-and-test"],
                                          strategy: {
                                              ...workflow?.jobs?.["build-and-test"]?.strategy,
                                              matrix: {
                                                  ...workflow?.jobs?.["build-and-test"]?.strategy
                                                      ?.matrix,
                                                  ["node-version"]: versions
                                              }
                                          }
                                      }
                                  }
                              },
                              {
                                  indent: 2,
                                  flowLevel: -1,
                                  schema: JSON_SCHEMA,
                                  lineWidth: 100,
                                  quotingType: '"'
                              }
                          )
                      )
                  )
        )
    );

    return toAsyncNullable(allAsyncResults([newVersions, file]))
        .then(mapNullableFn(noneNull))
        .then(
            mapNullableFn(([newVersions, file]) => ({
                type: "fs-stage-update",
                log: `ci(github): add node versions ${newVersions.join(" || ")} to CI workflow`,
                apply: async stage => insert(stage, ".github/workflows/ci.yml", file)
            }))
        );
}
