import chain from "@softwareventures/chain";
import {any, append, excludeFn, first} from "@softwareventures/array";
import {intersects} from "semver";
import {mapNullableFn} from "@softwareventures/nullable";
import {Project} from "../project/project";
import {FsStageUpdate} from "../project/update";
import {toAsyncNullable} from "../result/result";
import {nodeVersionRange} from "../node/version-range";
import {insert} from "../fs-stage/fs-stage";
import {looseSort} from "../semver/loose-sort";
import {looseLt} from "../semver/loose-lt";
import {modifyPackageJson} from "./modify-package-json";

export async function addNewNodeVersionsToPackageJson(
    project: Project
): Promise<FsStageUpdate | null> {
    const newVersions = chain(project.node.currentReleases)
        .map(
            excludeFn(release =>
                any(project.node.targetVersions, version =>
                    intersects(`^${version}`, `^${release}`)
                )
            )
        )
        .map(
            excludeFn(release => looseLt(release, first(project.node.targetVersions) ?? "0.0.0"))
        ).value;

    if (newVersions.length === 0) {
        return null;
    }

    const resultVersions = chain(project.node.targetVersions)
        .map(append(newVersions))
        .map(looseSort).value;

    const resultVersionRange = nodeVersionRange(resultVersions);

    const file = modifyPackageJson(project, packageJson => ({
        ...packageJson,
        engines: {
            ...packageJson?.engines,
            node: resultVersionRange
        }
    }));

    return toAsyncNullable(file).then(
        mapNullableFn(file => ({
            type: "fs-stage-update",
            log: `fix(node): declare support for node ${newVersions.join(", ")}`,
            apply: async stage => insert(stage, "package.json", file),
            updatedProject: {
                ...project,
                node: {
                    ...project.node,
                    targetVersions: newVersions
                }
            }
        }))
    );
}
