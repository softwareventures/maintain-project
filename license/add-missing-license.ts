import {Project} from "../project/project";
import {Update} from "../project/update";
import {projectFileExists} from "../project/file-exists";
import {writeLicense} from "./write";

export async function addMissingLicense(project: Project): Promise<Update | null> {
    return projectFileExists(project, "LICENSE.md").then(exists =>
        exists
            ? null
            : {
                  type: "fs-stage-update",
                  log: "docs(license): add missing LICENSE.md",
                  apply: writeLicense(project)
              }
    );
}
