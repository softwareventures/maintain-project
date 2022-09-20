import {hasProperty} from "unknown";
import type {ProjectSource} from "./project";
import {statProjectFile} from "./stat-file";

export async function projectFileExists(project: ProjectSource, path: string): Promise<boolean> {
    return statProjectFile(project, path).then(
        () => true,
        (reason: unknown) => {
            if (hasProperty(reason, "code") && reason.code === "ENOENT") {
                return false;
            } else {
                throw reason;
            }
        }
    );
}
