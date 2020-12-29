import {FsChangeset, insert, InsertResult} from "../../fs-changeset/fs-changeset";
import {chainAsyncResultsFn} from "../../result/result";
import {copy} from "../../template/copy";
import {modifyXml} from "../../template/modify-xml";
import {Project} from "../project";

export function writeIdeaRunConfigurations(
    project: Project
): (fsChangeset: FsChangeset) => Promise<InsertResult> {
    return chainAsyncResultsFn([
        writeIdeaRunConfigurationFix,
        writeIdeaRunConfigurationLint,
        writeIdeaRunConfigurationTest,
        writeIdeaRunConfigurationStart(project)
    ]);
}

async function writeIdeaRunConfigurationFix(fsChangeset: FsChangeset): Promise<InsertResult> {
    return copy("idea.template/runConfigurations/fix.xml").then(file =>
        insert(fsChangeset, ".idea/runConfigurations/fix.xml", file)
    );
}

async function writeIdeaRunConfigurationLint(fsChangeset: FsChangeset): Promise<InsertResult> {
    return copy("idea.template/runConfigurations/lint.xml").then(file =>
        insert(fsChangeset, ".idea/runConfigurations/lint.xml", file)
    );
}

async function writeIdeaRunConfigurationTest(fsChangeset: FsChangeset): Promise<InsertResult> {
    return copy("idea.template/runConfigurations/test.xml").then(file =>
        insert(fsChangeset, ".idea/runConfigurations/test.xml", file)
    );
}

function writeIdeaRunConfigurationStart(
    project: Project
): (fsChangeset: FsChangeset) => Promise<InsertResult> {
    if (project.target === "webapp") {
        return async fsChangeset =>
            modifyXml("idea.template/runConfigurations/test.xml", dom => {
                const document = dom.window.document;

                const configuration = document.querySelector("configuration");
                configuration?.setAttribute("name", "start");
                const command = document.querySelector("command");
                command?.setAttribute("value", "start");

                return dom;
            }).then(file => insert(fsChangeset, ".idea/runConfigurations/start.xml", file));
    } else {
        return async fsChangeset => ({type: "success", value: fsChangeset});
    }
}
