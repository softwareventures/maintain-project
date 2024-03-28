import {anyFn} from "@softwareventures/array";
import type {Project} from "../project/project.js";
import type {Update} from "../project/update.js";
import {projectFileExists} from "../project/file-exists.js";
import {writeLicense} from "./write.js";

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
