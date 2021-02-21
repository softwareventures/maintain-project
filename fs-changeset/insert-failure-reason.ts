import {FileExists} from "./file-exists";
import {FileNotFound} from "./file-not-found";
import {NotADirectory} from "./not-a-directory";

export type InsertFailureReason = NotADirectory | FileNotFound | FileExists;