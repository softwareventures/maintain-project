import {Project} from "../project/project";
import {Update} from "../project/update";
import {statProjectFile} from "../project/stat-file";
import {writeLicense} from "./write";

export async function addMissingLicense(project: Project): Promise<Update | null> {
    return statProjectFile(project, "LICENSE.md")
        .then(
            () => false,
            reason => {
                if (reason.code === "ENOENT") {
                    return true;
                } else {
                    throw reason;
                }
            }
        )
        .then(missing =>
            missing
                ? {
                      log: "docs(LICENSE): add missing LICENSE.md",
                      apply: writeLicense(project)
                  }
                : null
        );
}
