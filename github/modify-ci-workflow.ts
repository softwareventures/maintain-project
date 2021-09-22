import {Document} from "yaml";
import {ProjectSource} from "../project/project";
import {ReadYamlFailureReason} from "../project/read-yaml";
import {Result} from "../result/result";
import {File} from "../fs-stage/file";
import {modifyProjectYaml} from "../project/modify-yaml";

export async function modifyCiWorkflow(
    project: ProjectSource,
    modify: (workflow: Document.Parsed) => Document.Parsed
): Promise<Result<ReadYamlFailureReason, File>> {
    return modifyProjectYaml(project, ".github/workflows/ci", modify);
}
