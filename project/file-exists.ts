import {ProjectSource} from "./project";
import {statProjectFile} from "./stat-file";

export async function projectFileExists(project: ProjectSource, path: string): Promise<boolean> {
    return statProjectFile(project, path).then(
        () => true,
        reason => {
            if (reason.code === "ENOENT") {
                return false;
            } else {
                throw reason;
            }
        }
    );
}
