import type {Document} from "yaml";
import type {ProjectSource} from "../project/project.js";
import type {ReadYamlFailureReason} from "../project/read-yaml.js";
import type {Result} from "../result/result.js";
import type {File} from "../fs-stage/file.js";
import {modifyProjectYaml} from "../project/modify-yaml.js";

export async function modifyCiWorkflow(
    project: ProjectSource,
    modify: (workflow: Document.Parsed) => Document.Parsed
): Promise<Result<ReadYamlFailureReason, File>> {
    return modifyProjectYaml(project, ".github/workflows/ci.yml", modify);
}
