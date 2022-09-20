import {sep} from "path";
import type {ProjectSource} from "../project/project";
import type {ReadXmlResult} from "../project/read-xml";
import {readProjectXml} from "../project/read-xml";

export async function readProjectRunConfiguration(
    project: ProjectSource,
    name: string
): Promise<ReadXmlResult> {
    return readProjectXml(project, `.idea${sep}runConfigurations${sep}${name}.xml`);
}
