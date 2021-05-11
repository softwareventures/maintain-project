import {FileIsDirectory} from "./file-is-directory";
import {FileNotFound} from "./file-not-found";
import {NotADirectory} from "./not-a-directory";
import {InvalidPath} from "./invalid-path";

export type ReadFileFailureReason = InvalidPath | NotADirectory | FileIsDirectory | FileNotFound;
