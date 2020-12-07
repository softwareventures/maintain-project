import {Directory} from "./directory";

export interface FsChangeset {
    readonly root: Directory;
    readonly overwrite?: boolean;
}
