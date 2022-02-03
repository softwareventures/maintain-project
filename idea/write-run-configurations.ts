import {FsStage, insert, InsertResult} from "../fs-stage/fs-stage";
import {chainAsyncResultsFn, success} from "../result/result";
import {copyFromTemplate} from "../template/copy";
import {modifyTemplateXml} from "../template/modify-xml";
import {Project} from "../project/project";
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
            modifyTemplateXml({
                templateId: projectTemplateId(project),
                pathSegments: [".idea", "runConfigurations", "test.xml"],
                modify: dom => {
                    const document = dom.window.document;

                    const configuration = document.querySelector("configuration");
                    configuration?.setAttribute("name", "start");
                    const command = document.querySelector("command");
                    command?.setAttribute("value", "start");

                    return dom;
                }
            }).then(file => insert(fsStage, ".idea/runConfigurations/start.xml", file));
    } else {
        return async fsStage => success(fsStage);
    }
}
