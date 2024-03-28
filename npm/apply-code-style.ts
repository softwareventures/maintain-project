import {mapNullableFn} from "@softwareventures/nullable";
import type {Project} from "../project/project.js";
import type {FsStageUpdate} from "../project/update.js";
import {toNullable} from "../result/result.js";
import {insert} from "../fs-stage/fs-stage.js";
import {modifyPackageJson} from "./modify-package-json.js";

export async function applyCodeStyleToPackageJson(project: Project): Promise<FsStageUpdate | null> {
    return modifyPackageJson(project, packageJson => packageJson as unknown)
        .then(toNullable)
        .then(
            mapNullableFn(file => ({
                type: "fs-stage-update",
                log: "style(package.json): apply code style",
                apply: async stage => insert(stage, "package.json", file)
            }))
        );
}
