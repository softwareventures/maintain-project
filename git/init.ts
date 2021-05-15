import {mapFn} from "@softwareventures/array";
import {FsStage, insertFn, InsertResult, insertSubdirectoryFn} from "../fs-stage/fs-stage";
import {asyncFn, liftFunctionFromPromise} from "../promises/promises";
import {chainAsyncResults, chainAsyncResultsFn, chainResultsFn} from "../result/result";
import {copyFromTemplate} from "../template/copy";
import {listTemplates} from "../template/list";

export async function gitInit(fsStage: FsStage): Promise<InsertResult> {
    return chainAsyncResults(fsStage, [
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
                .then(
                    mapFn(async path =>
                        copyFromTemplate(`git.template/${path}`).then(file =>
                            insertFn(`.git/${path}`, file)
                        )
                    )
                )
                .then(mapFn(liftFunctionFromPromise))
                .then(chainAsyncResultsFn)
        )
    ]);
}
