import {FsStage, insert, InsertResult} from "../fs-stage/fs-stage";
import {chainAsyncResultsFn, success} from "../result/result";
import {copyFromTemplate} from "../template/copy";
import {modifyTemplateXml} from "../template/modify-xml";
import {Project} from "../project/project";

export function writeIdeaRunConfigurations(
    project: Project
): (fsStage: FsStage) => Promise<InsertResult> {
    return chainAsyncResultsFn([
        writeIdeaRunConfigurationFix,
        writeIdeaRunConfigurationLint,
        writeIdeaRunConfigurationTest,
        writeIdeaRunConfigurationStart(project)
    ]);
}

async function writeIdeaRunConfigurationFix(fsStage: FsStage): Promise<InsertResult> {
    return copyFromTemplate("idea.template/runConfigurations/fix.xml").then(file =>
        insert(fsStage, ".idea/runConfigurations/fix.xml", file)
    );
}

async function writeIdeaRunConfigurationLint(fsStage: FsStage): Promise<InsertResult> {
    return copyFromTemplate("idea.template/runConfigurations/lint.xml").then(file =>
        insert(fsStage, ".idea/runConfigurations/lint.xml", file)
    );
}

async function writeIdeaRunConfigurationTest(fsStage: FsStage): Promise<InsertResult> {
    return copyFromTemplate("idea.template/runConfigurations/test.xml").then(file =>
        insert(fsStage, ".idea/runConfigurations/test.xml", file)
    );
}

function writeIdeaRunConfigurationStart(
    project: Project
): (fsStage: FsStage) => Promise<InsertResult> {
    if (project.target === "webapp") {
        return async fsStage =>
            modifyTemplateXml("idea.template/runConfigurations/test.xml", dom => {
                const document = dom.window.document;

                const configuration = document.querySelector("configuration");
                configuration?.setAttribute("name", "start");
                const command = document.querySelector("command");
                command?.setAttribute("value", "start");

                return dom;
            }).then(file => insert(fsStage, ".idea/runConfigurations/start.xml", file));
    } else {
        return async fsStage => success(fsStage);
    }
}
