import {mapNullableFn, notNull} from "@softwareventures/nullable";
import {YAMLMap} from "yaml/types";
import {any, filter, indexOf, isArray, last} from "@softwareventures/array";
import {hasProperty} from "unknown";
import type {Project} from "../project/project";
import type {FsStageUpdate} from "../project/update";
import {toNullable} from "../result/result";
import {insert} from "../fs-stage/fs-stage";
import {readProjectScript} from "../npm/read-script";
import {modifyCiWorkflow} from "./modify-ci-workflow";

export async function addYarnLintToCiWorkflow(project: Project): Promise<FsStageUpdate | null> {
    const file = readProjectScript(project, "lint").then(
        mapNullableFn(async () =>
            modifyCiWorkflow(project, workflow => {
                const stepsNode = workflow.getIn(["jobs", "build-and-test", "steps"]) as unknown;
                const steps = hasProperty(stepsNode, "items") ? stepsNode.items : null;
                if (!isArray(steps)) {
                    return workflow;
                }
                const stepMaps = filter(steps, (step): step is YAMLMap => step instanceof YAMLMap);
                const yarnSteps = filter(stepMaps, step =>
                    Boolean(/^\s*yarn\s/u.exec(String(step.get("run"))))
                );
                if (
                    any(yarnSteps, step =>
                        Boolean(/^\s*yarn\s+(run\s+)?lint\s*$/u.exec(String(step.get("run"))))
                    )
                ) {
                    return workflow;
                }
                const lastYarnStep = last(yarnSteps);
                if (lastYarnStep == null) {
                    return workflow;
                }
                const insertAfterIndex = notNull(indexOf(steps, lastYarnStep));
                workflow.setIn(
                    ["jobs", "build-and-test", "steps"],
                    [
                        ...steps.slice(0, insertAfterIndex + 1),
                        {run: "yarn lint"},
                        ...steps.slice(insertAfterIndex + 1)
                    ]
                );
                return workflow;
            })
        )
    );

    return file.then(mapNullableFn(toNullable)).then(
        mapNullableFn(file => ({
            type: "fs-stage-update",
            log: "ci(github): add yarn lint to CI workflow",
            apply: async stage => insert(stage, ".github/workflows/ci.yml", file)
        }))
    );
}
