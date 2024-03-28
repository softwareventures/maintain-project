import {JSDOM} from "jsdom";
import type {Result} from "../result/result.js";
import {failure, mapResultFn} from "../result/result.js";
import type {ProjectSource} from "./project.js";
import type {ReadTextFailureReason} from "./read-text.js";
import {readProjectText} from "./read-text.js";

export type ReadXmlResult = Result<ReadXmlFailureReason, JSDOM>;

export type ReadXmlFailureReason = ReadTextFailureReason | InvalidXml;

export interface InvalidXml {
    readonly type: "invalid-xml";
    path: string;
}

export async function readProjectXml(project: ProjectSource, path: string): Promise<ReadXmlResult> {
    return readProjectText(project, path)
        .then(mapResultFn(text => new JSDOM(text, {contentType: "application/xml"})))
        .catch(reason => {
            if (reason instanceof DOMException) {
                return failure([{type: "invalid-xml", path}]);
            } else {
                throw reason;
            }
        });
}
