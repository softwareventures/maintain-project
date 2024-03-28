import type {ParsedCommandLine} from "typescript";
import typescript from "typescript";
import type {ProjectSource} from "../project/project.js";
import type {ReadJsonFailureReason} from "../project/read-json.js";
import {readProjectJson} from "../project/read-json.js";
import type {Result} from "../result/result.js";
import {mapResultFn} from "../result/result.js";

export type ReadTsconfigResult = Result<ReadJsonFailureReason, ParsedCommandLine>;

export async function readTsconfig(project: ProjectSource): Promise<ReadTsconfigResult> {
    return readProjectJson(project, "tsconfig.json").then(
        mapResultFn(json =>
            typescript.parseJsonConfigFileContent(
                json,
                typescript.sys,
                project.path,
                undefined,
                "tsconfig.json"
            )
        )
    );
}
