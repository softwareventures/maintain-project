import type {FileExists} from "./file-exists.js";
import type {FileNotFound} from "./file-not-found.js";
import type {NotADirectory} from "./not-a-directory.js";
import type {InvalidPath} from "./invalid-path.js";

export type InsertFailureReason = InvalidPath | NotADirectory | FileNotFound | FileExists;
