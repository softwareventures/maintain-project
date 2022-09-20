import type {Document} from "yaml";
import type {ProjectSource} from "../project/project";
import type {ReadYamlFailureReason} from "../project/read-yaml";
import type {Result} from "../result/result";
import type {File} from "../fs-stage/file";
import {modifyProjectYaml} from "../project/modify-yaml";

export async function modifyCiWorkflow(
    project: ProjectSource,
    modify: (workflow: Document.Parsed) => Document.Parsed
): Promise<Result<ReadYamlFailureReason, File>> {
    return modifyProjectYaml(project, ".github/workflows/ci.yml", modify);
}
