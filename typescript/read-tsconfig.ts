import {ParsedCommandLine, parseJsonConfigFileContent, sys} from "typescript";
import {ProjectSource} from "../project/project";
import {ReadJsonFailureReason, readProjectJson} from "../project/read-json";
import {mapResultFn, Result} from "../result/result";

export type ReadTsconfigResult = Result<ReadJsonFailureReason, ParsedCommandLine>;

export async function readTsconfig(project: ProjectSource): Promise<ReadTsconfigResult> {
    return readProjectJson(project, "tsconfig.json").then(
        mapResultFn(json =>
            parseJsonConfigFileContent(json, sys, project.path, undefined, "tsconfig.json")
        )
    );
}
