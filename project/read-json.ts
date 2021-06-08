import {ProjectSource} from "./project";
import {readProjectText} from "./read-text";

export async function readProjectJson(project: ProjectSource, path: string): Promise<any> {
    return readProjectText(project, path).then(JSON.parse);
}
