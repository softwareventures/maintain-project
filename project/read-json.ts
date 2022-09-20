import type {Result} from "../result/result";
import {failure, mapResultFn} from "../result/result";
import type {ProjectSource} from "./project";
import type {ReadTextFailureReason} from "./read-text";
import {readProjectText} from "./read-text";

// FIXME Use `unknown`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReadJsonResult = Result<ReadJsonFailureReason, any>;

export type ReadJsonFailureReason = ReadTextFailureReason | InvalidJson;

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
