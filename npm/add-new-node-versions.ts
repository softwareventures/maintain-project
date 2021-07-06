import chain from "@softwareventures/chain";
import {excludeFn, mapFn} from "@softwareventures/array";
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
import {looseSort} from "../semver/loose-sort";
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
    const resultVersionRange = allAsyncResults([oldVersionRange, newVersionRange])
        .then(mapResultFn(mapFn(range => (range === "" ? null : range))))
        .then(mapResultFn(noneNull))
        .then(mapResultFn(mapNullableFn(ranges => ranges.join(" || "))))
        .then(mapResultFn(mapNullableFn(range => range.split(/\s*\|\|\s*/))))
        .then(mapResultFn(mapNullableFn(looseSort)))
        .then(mapResultFn(mapNullableFn(ranges => ranges.join(" || "))));
    const file = resultVersionRange.then(
        bindAsyncResultFn(async range =>
            range == null
                ? success(null)
                : modifyPackageJson(project, packageJson => ({
                      ...packageJson,
                      engines: {
                          ...packageJson?.engines,
                          node: range
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
