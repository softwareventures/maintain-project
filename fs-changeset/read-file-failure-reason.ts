import {FileIsDirectory} from "./file-is-directory";
import {FileNotFound} from "./file-not-found";
import {NotADirectory} from "./not-a-directory";

export type ReadFileFailureReason = NotADirectory | FileIsDirectory | FileNotFound;
