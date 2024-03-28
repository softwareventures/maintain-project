import type {JSDOM} from "jsdom";
import type {Result} from "../result/result.js";
import {mapResultFn} from "../result/result.js";
import type {File} from "../fs-stage/file.js";
import {textFile} from "../fs-stage/file.js";
import type {ProjectSource} from "./project.js";
import type {ReadXmlFailureReason} from "./read-xml.js";
import {readProjectXml} from "./read-xml.js";

export async function modifyProjectXml(
    project: ProjectSource,
    path: string,
    modify: (dom: JSDOM) => JSDOM
): Promise<Result<ReadXmlFailureReason, File>> {
    return readProjectXml(project, path)
        .then(mapResultFn(modify))
        .then(mapResultFn(dom => textFile(dom.serialize())));
}
