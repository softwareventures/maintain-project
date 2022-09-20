import type {Result} from "../result/result";
import type {FileNode} from "./file-node";
import type {ReadFileFailureReason} from "./read-file-failure-reason";

export type ReadFileNodeResult = Result<ReadFileFailureReason, FileNode>;
