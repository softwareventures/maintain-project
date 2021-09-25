import {failure, mapResultFn, Result} from "../result/result";
import {FileNotFound} from "../fs-stage/file-not-found";
import {ProjectSource} from "./project";
import {readProjectText} from "./read-text";

export type ReadJsonResult = Result<ReadJsonFailureReason, any>;

export type ReadJsonFailureReason = FileNotFound | InvalidJson;

export interface InvalidJson {
    readonly type: "invalid-json";
    readonly path: string;
}

export async function readProjectJson(
    project: ProjectSource,
    path: string
): Promise<ReadJsonResult> {
    return readProjectText(project, path)
        .then(mapResultFn(JSON.parse))
        .catch(reason => {
            if (reason instanceof SyntaxError) {
                return failure([{type: "invalid-json", path}]);
            } else {
                throw reason;
            }
        });
}
