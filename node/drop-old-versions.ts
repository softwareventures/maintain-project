import {exclude, first, map, partition} from "@softwareventures/array";
import {intersects} from "semver";
import {Project} from "../project/project";
import {Update} from "../project/update";
import {looseSort} from "../semver/loose-sort";
import {looseLtr} from "../semver/loose-ltr";
import {modifyPackageJson} from "../npm/modify-package-json";
import {readProjectYamlAsDocument} from "../project/read-yaml";
import {chainAsyncResults, mapResultFn, toNullable} from "../result/result";
import {textFile} from "../fs-stage/file";
import {FsStage, insert} from "../fs-stage/fs-stage";
import {nodeVersionRange} from "./version-range";

export async function dropOldNodeVersions(project: Project): Promise<Update | null> {
    const range = nodeVersionRange(project.node.currentReleases);
    const firstInRange = first(looseSort(project.node.currentReleases));

    if (firstInRange == null) {
        return null;
    }

    const versionsToDrop = looseSort(
        exclude(project.node.targetVersions, version => intersects(range, `^${version}`))
    );

    if (versionsToDrop.length === 0) {
        return null;
    }

    const [versionsToDropBeforeRange, middleVersionsToDrop] = partition(versionsToDrop, version =>
        looseLtr(version, range)
    );
    const versionRangeToDrop = [
        ...(versionsToDropBeforeRange.length > 1 ? [`< ${firstInRange}`] : []),
        ...(versionsToDropBeforeRange.length === 1
            ? map(versionsToDropBeforeRange, version => `^${version}`)
            : []),
        ...map(middleVersionsToDrop, version => `^${version}`)
    ].join(" || ");

    const newPackageJsonFile = modifyPackageJson(project, packageJson => ({
        ...packageJson,
        engines: {
            ...packageJson?.engines,
            node: range
        }
    })).then(toNullable);

    const newWorkflowFile = readProjectYamlAsDocument(project, ".github/workflows/ci.yml")
        .then(
            mapResultFn(workflow => {
                const versions = workflow.getIn([
                    "jobs",
                    "build-and-test",
                    "strategy",
                    "matrix",
                    "node-version"
                ]);
                if (versions == null) {
                    return null;
                } else {
                    versions.items = map(project.node.currentReleases, release => `${release}.x`);
                    return textFile(String(workflow));
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
                      log: `feat(node): drop support for node ${versionRangeToDrop}`,
                      breaking: [
                          `node ${versionRangeToDrop} ${
                              versionsToDrop.length === 1 ? "is" : "are"
                          } no longer supported.`
                      ],
                      apply: async stage => chainAsyncResults(stage, actions),
                      updatedProject: {
                          ...project,
                          node: {
                              ...project.node,
                              targetVersions: project.node.currentReleases
                          }
                      }
                  }
        );
}
