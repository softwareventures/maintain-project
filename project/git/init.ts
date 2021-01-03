import {mapFn} from "@softwareventures/array";
import {
    FsChangeset,
    insertFn,
    InsertResult,
    insertSubdirectoryFn
} from "../../fs-changeset/fs-changeset";
import {asyncFn, liftFunctionFromPromise} from "../../promises/promises";
import {chainAsyncResults, chainAsyncResultsFn, chainResultsFn} from "../../result/result";
import {copy} from "../../template/copy";
import {listTemplates} from "../../template/list";

export async function gitInit(fsChangeset: FsChangeset): Promise<InsertResult> {
    return chainAsyncResults(fsChangeset, [
        asyncFn(
            chainResultsFn([
                insertSubdirectoryFn(".git/objects/info"),
                insertSubdirectoryFn(".git/objects/pack"),
                insertSubdirectoryFn(".git/refs/heads"),
                insertSubdirectoryFn(".git/refs/tags"),
                insertSubdirectoryFn(".git/hooks")
            ])
        ),
        liftFunctionFromPromise(
            listTemplates("git.template")
                .then(mapFn(async path => copy(path).then(file => insertFn(`.git/${path}`, file))))
                .then(mapFn(liftFunctionFromPromise))
                .then(chainAsyncResultsFn)
        )
    ]);
}
