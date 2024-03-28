import {map} from "@softwareventures/array";
import type {Document} from "yaml";
import type {ProjectSource} from "../project/project.js";
import type {Result} from "../result/result.js";
import {bindAsyncResultFn, bindFailureFn, failure, mapResultFn} from "../result/result.js";
import type {ReadYamlFailureReason} from "../project/read-yaml.js";
import {readProjectYamlAsDocument} from "../project/read-yaml.js";
import type {WriteYamlFailureReason} from "../project/write-yaml.js";
import {writeProjectYaml} from "../project/write-yaml.js";

export type SetYarnLinkerResult = Result<SetYarnLinkerFailureReason>;

export interface SetYarnLinkerFailureReason {
    readonly type: "set-yarn-linker-failed";
    readonly reason: ReadYamlFailureReason | WriteYamlFailureReason;
}

export async function setYarnLinkerToNodeModules(
    project: ProjectSource
): Promise<SetYarnLinkerResult> {
    return readProjectYamlAsDocument(project, ".yarnrc.yml")
        .then(
            mapResultFn(document => {
                document.set("nodeLinker", "node-modules");
                return document;
            })
        )
        .then(
            bindAsyncResultFn<ReadYamlFailureReason, WriteYamlFailureReason, Document.Parsed>(
                async document => writeProjectYaml(project, ".yarnrc.yml", document)
            )
        )
        .then(
            bindFailureFn(reasons =>
                failure(
                    map(
                        reasons,
                        reason =>
                            ({
                                type: "set-yarn-linker-failed",
                                reason
                            }) as const
                    )
                )
            )
        );
}
