import {map, partition} from "@softwareventures/array";
import {intersects} from "semver";
import {mapNullableFn} from "@softwareventures/nullable";
import type {Project} from "../project/project.js";
import type {FsStageUpdate} from "../project/update.js";
import {toAsyncNullable} from "../result/result.js";
import {insert} from "../fs-stage/fs-stage.js";
import {modifyCiWorkflow} from "./modify-ci-workflow.js";

export async function removeUnsupportedNodeVersions(
    project: Project
): Promise<FsStageUpdate | null> {
    if (project.node.targetVersions.length === 0 || project.node.testedVersions.length === 0) {
        return null;
    }

    const targetVersionRange = map(project.node.targetVersions, version => `^${version}`).join(
        " || "
    );

    const [resultVersions, removeVersions] = partition(project.node.testedVersions, version =>
        intersects(version, targetVersionRange)
    );

    if (removeVersions.length === 0) {
        return null;
    }

    const file = modifyCiWorkflow(project, workflow => {
        // FIXME
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        workflow.getIn(["jobs", "build-and-test", "strategy", "matrix", "node-version"]).items =
            map(resultVersions, version => `${version}.x`);
        return workflow;
    });

    return toAsyncNullable(file).then(
        mapNullableFn(file => ({
            type: "fs-stage-update",
            log: `ci(github): remove node version${
                removeVersions.length > 1 ? "s" : ""
            } ${removeVersions.join(", ")} from CI workflow`,
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
