import {FsChangeset, insert, InsertResult} from "../../fs-changeset/fs-changeset";
import {copy} from "../../template/copy";

export async function writeGitHubConfig(fsChangeset: FsChangeset): Promise<InsertResult> {
    return copy("github.template/workflows/ci.yml").then(file =>
        insert(fsChangeset, ".github/workflows/ci.yml", file)
    );
}
