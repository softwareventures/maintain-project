import {exclude, filter, first, map, partition} from "@softwareventures/array";
import {intersects} from "semver";
import {hasProperty} from "unknown";
import type {Project} from "../project/project.js";
import type {Update} from "../project/update.js";
import {looseSort} from "../semver/loose-sort.js";
import {looseLtr} from "../semver/loose-ltr.js";
import {modifyPackageJson} from "../npm/modify-package-json.js";
import {readProjectYamlAsDocument} from "../project/read-yaml.js";
import {chainAsyncResults, mapResultFn, toNullable} from "../result/result.js";
import {textFile} from "../fs-stage/file.js";
import type {FsStage} from "../fs-stage/fs-stage.js";
import {insert} from "../fs-stage/fs-stage.js";
import {nodeVersionRange} from "./version-range.js";

export async function dropOldNodeVersions(project: Project): Promise<Update | null> {
    const currentReleaseRange = nodeVersionRange(project.node.currentReleases);
    const earliestCurrentRelease = first(looseSort(project.node.currentReleases));

    if (earliestCurrentRelease == null) {
        return null;
    }

    const targetVersions = filter(project.node.targetVersions, version =>
        intersects(currentReleaseRange, `^${version}`)
    );

    const targetRange = nodeVersionRange(targetVersions);

    const versionsToDrop = looseSort(
        exclude(project.node.targetVersions, version =>
            intersects(currentReleaseRange, `^${version}`)
        )
    );

    if (versionsToDrop.length === 0) {
        return null;
    }

    const [versionsToDropBeforeRange, middleVersionsToDrop] = partition(versionsToDrop, version =>
        looseLtr(version, currentReleaseRange)
    );

    const versionsToDropText = [
        ...(versionsToDropBeforeRange.length > 1
            ? [`< ${earliestCurrentRelease}`]
            : versionsToDropBeforeRange),
        ...middleVersionsToDrop
    ].join(", ");

    const breakingText = `node version${
        versionsToDrop.length === 1 ? "" : "s"
    } ${versionsToDropText} ${versionsToDrop.length === 1 ? "is" : "are"} no longer supported.`;

    const newPackageJsonFile = modifyPackageJson(
        project,
        packageJson =>
            ({
                ...packageJson,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                engines: {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    ...packageJson?.engines,
                    node: targetRange
                }
            }) as unknown
    ).then(toNullable);

    const newWorkflowFile = readProjectYamlAsDocument(project, ".github/workflows/ci.yml")
        .then(
            mapResultFn(workflow => {
                const versions = workflow.getIn([
                    "jobs",
                    "build-and-test",
                    "strategy",
                    "matrix",
                    "node-version"
                ]) as unknown;
                if (hasProperty(versions, "items")) {
                    versions.items = map(targetVersions, release => `${release}.x`);
                    return textFile(String(workflow));
                } else {
                    return null;
                }
            })
        )
        .then(toNullable);

    return Promise.all([newPackageJsonFile, newWorkflowFile])
        .then(([newPackageJsonFile, newWorkflowFile]) => [
            ...(newPackageJsonFile == null
                ? []
                : [async (stage: FsStage) => insert(stage, "package.json", newPackageJsonFile)]),
            ...(newWorkflowFile == null
                ? []
                : [
                      async (stage: FsStage) =>
                          insert(stage, ".github/workflows/ci.yml", newWorkflowFile)
                  ])
        ])
        .then(actions =>
            actions.length === 0
                ? null
                : {
                      type: "fs-stage-update",
                      ...(project.target === "webapp"
                          ? {
                                log: `build(node): drop support for building in node ${versionsToDropText}`
                            }
                          : {
                                log: `feat(node): drop support for node ${versionsToDropText}`,
                                breaking: [breakingText]
                            }),
                      apply: async stage => chainAsyncResults(stage, actions),
                      updatedProject: {
                          ...project,
                          node: {
                              ...project.node,
                              targetVersions,
                              testedVersions: targetVersions
                          }
                      }
                  }
        );
}
