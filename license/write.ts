import {modifyText} from "../template/modify-text";
import {Project} from "../project/project";
import {FsStage, insert, InsertResult} from "../fs-stage/fs-stage";

export function writeLicense(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    const file = modifyText(
        "LICENSE.md",
        text =>
            `Copyright ${project.license.year} ${project.license.copyrightHolder ?? ""}`.trim() +
            "\n\n" +
            text
    );

    return async fsStage => file.then(file => insert(fsStage, "LICENSE.md", file));
}
