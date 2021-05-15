import {FsStage, insert, InsertResult} from "../fs-stage/fs-stage";
import {copy} from "../template/copy";

export async function writeGitHubConfig(fsStage: FsStage): Promise<InsertResult> {
    return copy("github.template/workflows/ci.yml").then(file =>
        insert(fsStage, ".github/workflows/ci.yml", file)
    );
}
