import {InternalFile} from "./internal-file";
import {InternalDirectory} from "./internal-directory";
import {InternalSpecialFile} from "./internal-special-file";
import {InternalNoFile} from "./internal-no-file";

export type InternalFileNode =
    | InternalDirectory
    | InternalFile
    | InternalSpecialFile
    | InternalNoFile;
