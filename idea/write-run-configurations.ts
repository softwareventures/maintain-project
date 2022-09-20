import type {FsStage, InsertResult} from "../fs-stage/fs-stage";
import {insert} from "../fs-stage/fs-stage";
import {chainAsyncResultsFn, success} from "../result/result";
import {copyFromTemplate} from "../template/copy";
import type {Project} from "../project/project";
import {projectTemplateId} from "../template/project-template-id";

export function writeIdeaRunConfigurations(
    project: Project
): (fsStage: FsStage) => Promise<InsertResult> {
    return chainAsyncResultsFn([
        writeIdeaRunConfigurationFix(project),
        writeIdeaRunConfigurationLint(project),
        writeIdeaRunConfigurationTest(project),
        writeIdeaRunConfigurationStart(project)
    ]);
}

export function writeIdeaRunConfigurationFix(
    project: Project
): (fsStage: FsStage) => Promise<InsertResult> {
    return async fsStage =>
        copyFromTemplate(projectTemplateId(project), ".idea", "runConfigurations", "fix.xml").then(
            file => insert(fsStage, ".idea/runConfigurations/fix.xml", file)
        );
}

export function writeIdeaRunConfigurationLint(
    project: Project
): (fsStage: FsStage) => Promise<InsertResult> {
    return async fsStage =>
        copyFromTemplate(projectTemplateId(project), ".idea", "runConfigurations", "lint.xml").then(
            file => insert(fsStage, ".idea/runConfigurations/lint.xml", file)
        );
}

export function writeIdeaRunConfigurationTest(
    project: Project
): (fsStage: FsStage) => Promise<InsertResult> {
    return async fsStage =>
        copyFromTemplate(projectTemplateId(project), ".idea", "runConfigurations", "test.xml").then(
            file => insert(fsStage, ".idea/runConfigurations/test.xml", file)
        );
}

export function writeIdeaRunConfigurationStart(
    project: Project
): (fsStage: FsStage) => Promise<InsertResult> {
    if (project.target === "webapp") {
        return async fsStage =>
            copyFromTemplate(
                projectTemplateId(project),
                ".idea",
                "runConfigurations",
                "start.xml"
            ).then(file => insert(fsStage, ".idea/runConfigurations/start.xml", file));
    } else {
        return async fsStage => success(fsStage);
    }
}
