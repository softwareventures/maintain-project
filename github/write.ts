import {FsStage, insert, InsertResult} from "../fs-stage/fs-stage";
import {copyFromTemplate} from "../template/copy";

export async function writeGitHubConfig(fsStage: FsStage): Promise<InsertResult> {
    return copyFromTemplate("github.template/workflows/ci.yml").then(file =>
        insert(fsStage, ".github/workflows/ci.yml", file)
    );
}
