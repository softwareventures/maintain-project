import {append, exclude, map} from "@softwareventures/array";
import chain from "@softwareventures/chain";
import {intersects} from "semver";
import {mapNullableFn} from "@softwareventures/nullable";
import {Project} from "../project/project";
import {FsStageUpdate} from "../project/update";
import {readProjectYamlAsDocument} from "../project/read-yaml";
import {bindAsyncResultFn, mapResultFn, success, toAsyncNullable} from "../result/result";
import {looseSort} from "../semver/loose-sort";
import {insert} from "../fs-stage/fs-stage";
import {textFile} from "../fs-stage/file";

export async function addMissingNodeVersionsToGitHubActions(
    project: Project
): Promise<FsStageUpdate | null> {
    if (project.node.testedVersions.length === 0) {
        return null;
    }

    const oldVersionRange = map(project.node.testedVersions, version => `^${version}`).join(" || ");

    const newVersions = exclude(project.node.targetVersions, version =>
        intersects(oldVersionRange, `^${version}`)
    );

    if (newVersions.length === 0) {
        return null;
    }

    const resultVersions = chain(newVersions)
        .map(append(project.node.testedVersions))
        .map(looseSort).value;

    const file = readProjectYamlAsDocument(project, ".github/workflows/ci.yml")
        .then(
            mapResultFn(workflow => {
                workflow.getIn([
                    "jobs",
                    "build-and-test",
                    "strategy",
                    "matrix",
                    "node-version"
                ]).items = map(resultVersions, version => `${version}.x`);
                return workflow;
            })
        )
        .then(
            bindAsyncResultFn(async workflow =>
                workflow == null ? success(null) : success(textFile(String(workflow)))
            )
        );

    return toAsyncNullable(file).then(
        mapNullableFn(file => ({
            type: "fs-stage-update",
            log: `ci(github): add node version${
                newVersions.length > 1 ? "s" : ""
            } ${newVersions.join(", ")} to CI workflow`,
            apply: async stage => insert(stage, ".github/workflows/ci.yml", file),
            updatedProject: {
                ...project,
                node: {
                    ...project.node,
                    testedVersions: resultVersions
                }
            }
        }))
    );
}
