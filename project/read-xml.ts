import {JSDOM} from "jsdom";
import {failure, mapResultFn, Result} from "../result/result";
import {ProjectSource} from "./project";
import {readProjectText, ReadTextFailureReason} from "./read-text";

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
