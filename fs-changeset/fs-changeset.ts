import {resolve} from "path";
import {InternalFileNode} from "./internal-file-node";
import {internalOpenUnderlyingFile} from "./internal-open-underlying-file";

export interface FsChangeset {
    readonly path: string;
    readonly root: InternalFileNode;
}

export async function openFsChangeset(path: string): Promise<FsChangeset> {
    const fullPath = resolve(path);
    return internalOpenUnderlyingFile(fullPath).then(root => ({path: fullPath, root}));
}
