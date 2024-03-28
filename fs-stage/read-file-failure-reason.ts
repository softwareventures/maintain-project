import type {FileIsDirectory} from "./file-is-directory.js";
import type {FileNotFound} from "./file-not-found.js";
import type {NotADirectory} from "./not-a-directory.js";
import type {InvalidPath} from "./invalid-path.js";

export type ReadFileFailureReason = InvalidPath | NotADirectory | FileIsDirectory | FileNotFound;
