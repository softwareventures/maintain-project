import {promises as fs} from "fs";
import {InternalFileNode} from "./internal-file-node";
import {internalNoFile} from "./internal-no-file";
import {internalDirectory} from "./internal-directory";
import {internalFile} from "./internal-file";
import {internalSpecialFile} from "./internal-special-file";

export async function internalOpenUnderlyingFile(path: string): Promise<InternalFileNode> {
    return fs.stat(path, {bigint: true}).then(
        stat =>
            stat.isDirectory()
                ? internalDirectory({
                      path,
                      underlyingMTime: stat.mtimeMs
                  })
                : stat.isFile()
                ? internalFile(stat.mtimeMs)
                : internalSpecialFile(stat.mtimeMs),
        reason => {
            if (reason.code === "ENOENT") {
                return internalNoFile;
            } else {
                throw reason;
            }
        }
    );
}
