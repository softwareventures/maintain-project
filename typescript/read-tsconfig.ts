import type {ParsedCommandLine} from "typescript";
import {parseJsonConfigFileContent, sys} from "typescript";
import type {ProjectSource} from "../project/project";
import type {ReadJsonFailureReason} from "../project/read-json";
import {readProjectJson} from "../project/read-json";
import type {Result} from "../result/result";
import {mapResultFn} from "../result/result";

export type ReadTsconfigResult = Result<ReadJsonFailureReason, ParsedCommandLine>;

export async function readTsconfig(project: ProjectSource): Promise<ReadTsconfigResult> {
    return readProjectJson(project, "tsconfig.json").then(
        mapResultFn(json =>
            parseJsonConfigFileContent(json, sys, project.path, undefined, "tsconfig.json")
        )
    );
}
