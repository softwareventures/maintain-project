import {map, partition} from "@softwareventures/array";
import {intersects} from "semver";
import {mapNullableFn} from "@softwareventures/nullable";
import {Project} from "../project/project";
import {FsStageUpdate} from "../project/update";
import {toAsyncNullable} from "../result/result";
import {insert} from "../fs-stage/fs-stage";
import {modifyCiWorkflow} from "./modify-ci-workflow";

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
