import type {FileExists} from "./file-exists";
import type {FileNotFound} from "./file-not-found";
import type {NotADirectory} from "./not-a-directory";
import type {InvalidPath} from "./invalid-path";

export type InsertFailureReason = InvalidPath | NotADirectory | FileNotFound | FileExists;
