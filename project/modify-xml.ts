import type {JSDOM} from "jsdom";
import type {Result} from "../result/result";
import {mapResultFn} from "../result/result";
import type {File} from "../fs-stage/file";
import {textFile} from "../fs-stage/file";
import type {ProjectSource} from "./project";
import type {ReadXmlFailureReason} from "./read-xml";
import {readProjectXml} from "./read-xml";

export async function modifyProjectXml(
    project: ProjectSource,
    path: string,
    modify: (dom: JSDOM) => JSDOM
): Promise<Result<ReadXmlFailureReason, File>> {
    return readProjectXml(project, path)
        .then(mapResultFn(modify))
        .then(mapResultFn(dom => textFile(dom.serialize())));
}
