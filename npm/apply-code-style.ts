import {mapNullableFn} from "@softwareventures/nullable";
import {Project} from "../project/project";
import {FsStageUpdate} from "../project/update";
import {toNullable} from "../result/result";
import {insert} from "../fs-stage/fs-stage";
import {modifyPackageJson} from "./modify-package-json";

export async function applyCodeStyleToPackageJson(project: Project): Promise<FsStageUpdate | null> {
    return modifyPackageJson(project, packageJson => packageJson)
        .then(toNullable)
        .then(
            mapNullableFn(file => ({
                type: "fs-stage-update",
                log: "style(package.json): apply code style",
                apply: async stage => insert(stage, "package.json", file)
            }))
        );
}
