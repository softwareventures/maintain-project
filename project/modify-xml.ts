import {JSDOM} from "jsdom";
import {mapResultFn, Result} from "../result/result";
import {File, textFile} from "../fs-stage/file";
import {ProjectSource} from "./project";
import {readProjectXml, ReadXmlFailureReason} from "./read-xml";

export async function modifyProjectXml(
    project: ProjectSource,
    path: string,
    modify: (dom: JSDOM) => JSDOM
): Promise<Result<ReadXmlFailureReason, File>> {
    return readProjectXml(project, path)
        .then(mapResultFn(modify))
        .then(mapResultFn(dom => textFile(dom.serialize())));
}
