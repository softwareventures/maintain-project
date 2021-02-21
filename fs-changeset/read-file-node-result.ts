import {Result} from "../result/result";
import {FileNode} from "./file-node";
import {ReadFileFailureReason} from "./read-file-failure-reason";

export type ReadFileNodeResult = Result<ReadFileFailureReason, FileNode>;
