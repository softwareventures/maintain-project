import chain from "@softwareventures/chain";
import {excludeFn} from "@softwareventures/array";
import {intersects} from "semver";
import {mapNullableFn} from "@softwareventures/nullable";
import {Project} from "../project/project";
import {FsStageUpdate} from "../project/update";
import {readProjectJson} from "../project/read-json";
import {
    allAsyncResults,
    bindAsyncResultFn,
    mapResultFn,
    success,
    toAsyncNullable
} from "../result/result";
import {nodeVersionRange} from "../node/version-range";
import {noneNull} from "../collections/arrays";
import {insert} from "../fs-stage/fs-stage";
import {looseLtr} from "../semver/loose-ltr";
import {modifyPackageJson} from "./modify-package-json";

export async function addNewNodeVersionsToPackageJson(
    project: Project
): Promise<FsStageUpdate | null> {
    const packageJson = readProjectJson(project, "package.json");
    const oldVersionRange = packageJson.then(
        mapResultFn(packageJson => String(packageJson?.engines?.node ?? ""))
    );
    const newVersionRange = oldVersionRange.then(
        mapResultFn(range =>
            range === ""
                ? null
                : chain(project.node.currentReleases)
                      .map(excludeFn(release => intersects(range, `^${release}`)))
                      .map(excludeFn(release => looseLtr(release, range)))
                      .map(nodeVersionRange).value
        )
    );
    const file = allAsyncResults([oldVersionRange, newVersionRange]).then(
        bindAsyncResultFn(async ([oldVersionRange, newVersionRange]) =>
            newVersionRange == null || newVersionRange === ""
                ? success(null)
                : modifyPackageJson(project, packageJson => ({
                      ...packageJson,
                      engines: {
                          ...packageJson?.engines,
                          node: `${oldVersionRange} || ${newVersionRange}`
                      }
                  }))
        )
    );

    return toAsyncNullable(allAsyncResults([newVersionRange, file]))
        .then(mapNullableFn(noneNull))
        .then(
            mapNullableFn(([newVersionRange, file]) => ({
                type: "fs-stage-update",
                log: `fix(node): declare support for node ${newVersionRange}`,
                apply: async stage => insert(stage, "package.json", file)
            }))
        );
}
