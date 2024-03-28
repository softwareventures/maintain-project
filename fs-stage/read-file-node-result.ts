import type {Result} from "../result/result.js";
import type {FileNode} from "./file-node.js";
import type {ReadFileFailureReason} from "./read-file-failure-reason.js";

export type ReadFileNodeResult = Result<ReadFileFailureReason, FileNode>;
