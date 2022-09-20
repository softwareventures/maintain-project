import type {FileIsDirectory} from "./file-is-directory";
import type {FileNotFound} from "./file-not-found";
import type {NotADirectory} from "./not-a-directory";
import type {InvalidPath} from "./invalid-path";

export type ReadFileFailureReason = InvalidPath | NotADirectory | FileIsDirectory | FileNotFound;
