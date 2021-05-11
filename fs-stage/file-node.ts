import {head, isArray, tail} from "@softwareventures/array";
import {failure, mapFailure, success} from "../result/result";
import {Directory} from "./directory";
import {File} from "./file";
import {ReadFileNodeResult} from "./read-file-node-result";

export type FileNode = Directory | File;

export function pathSegments(path: string | readonly string[]): readonly string[] {
    return isArray(path) ? path : path.split("/");
}

export function readFileNode(root: FileNode, path: string | readonly string[]): ReadFileNodeResult {
    return readFileNodeInternal(root, pathSegments(path));
}

function readFileNodeInternal(root: FileNode, path: readonly string[]): ReadFileNodeResult {
    const entryName = head(path);
    const rest = tail(path);

    if (entryName == null) {
        return success(root);
    } else if (rest.length === 0) {
        return success(root);
    } else if (root.type !== "directory") {
        return failure([{type: "not-a-directory", path: entryName}]);
    }

    const entry = root.entries.get(entryName);

    if (entry == null) {
        return failure([{type: "file-not-found", path: entryName}]);
    } else {
        return mapFailure(readFileNodeInternal(entry, rest), reason => ({
            ...reason,
            path: `${entryName}/${reason.path}`
        }));
    }
}
