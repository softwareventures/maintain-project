import {anyFn} from "@softwareventures/array";
import type {Project} from "../project/project";
import type {Update} from "../project/update";
import {projectFileExists} from "../project/file-exists";
import {writeLicense} from "./write";

export async function addMissingLicense(project: Project): Promise<Update | null> {
    return Promise.all([
        projectFileExists(project, "LICENSE"),
        projectFileExists(project, "LICENSE.md"),
        projectFileExists(project, "LICENSE.txt")
    ])
        .then(anyFn(exists => exists))
        .then(exists =>
            exists
                ? null
                : {
                      type: "fs-stage-update",
                      log: "docs(license): add missing LICENSE.md",
                      apply: writeLicense(project)
                  }
        );
}
