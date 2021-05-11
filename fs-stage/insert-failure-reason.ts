import {FileExists} from "./file-exists";
import {FileNotFound} from "./file-not-found";
import {NotADirectory} from "./not-a-directory";
import {InvalidPath} from "./invalid-path";

export type InsertFailureReason = InvalidPath | NotADirectory | FileNotFound | FileExists;
