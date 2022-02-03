import {sep} from "path";
import {ProjectSource} from "../project/project";
import {readProjectXml, ReadXmlResult} from "../project/read-xml";

export async function readProjectRunConfiguration(project: ProjectSource, name: string): Promise<ReadXmlResult> {
    return readProjectXml(project, `.idea${sep}runConfigurations${sep}${name}.xml`);
}
