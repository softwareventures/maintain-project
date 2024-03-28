import {sep} from "path";
import type {ProjectSource} from "../project/project.js";
import type {ReadXmlResult} from "../project/read-xml.js";
import {readProjectXml} from "../project/read-xml.js";

export async function readProjectRunConfiguration(
    project: ProjectSource,
    name: string
): Promise<ReadXmlResult> {
    return readProjectXml(project, `.idea${sep}runConfigurations${sep}${name}.xml`);
}
