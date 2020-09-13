import {resolve, sep} from "path";
import {filter} from "@softwareventures/array";
import {copy} from "../../task/copy";
import {modifyXml} from "../../task/modify-xml";
import {Result} from "../../task/result";
import {Project} from "../project";

export function writeIdeaRunConfigurations(project: Project): Array<Promise<Result>> {
    return [
        writeIdeaRunConfigurationFix(project),
        writeIdeaRunConfigurationLint(project),
        writeIdeaRunConfigurationTest(project),
        writeIdeaRunConfigurationStart(project)
    ];
}

async function writeIdeaRunConfigurationFix(project: Project): Promise<Result> {
    return copy(
        `idea.template${sep}runConfigurations${sep}fix.xml`,
        project.path,
        `.idea${sep}runConfigurations${sep}fix.xml`
    );
}

async function writeIdeaRunConfigurationLint(project: Project): Promise<Result> {
    return copy(
        `idea.template${sep}runConfigurations${sep}lint.xml`,
        project.path,
        `.idea${sep}runConfigurations${sep}lint.xml`
    );
}

async function writeIdeaRunConfigurationTest(project: Project): Promise<Result> {
    return modifyXml("idea.template/runConfigurations/test.xml", document => {
        if (project.target === "webapp") {
            const npmBeforeRunTasks = document.querySelectorAll(
                "method>option[name=NpmBeforeRunTask]"
            );
            const beforeRunNpmInstall = filter(
                npmBeforeRunTasks,
                task => task.querySelector("command[value=install]") != null
            );
            for (const task of beforeRunNpmInstall) {
                task.parentElement?.removeChild?.(task);
            }
        }
        return {destPath: resolve(project.path, ".idea", "test.xml")};
    });
}

async function writeIdeaRunConfigurationStart(project: Project): Promise<Result> {
    if (project.target === "webapp") {
        return modifyXml("idea.template/runConfigurations/test.xml", document => {
            const configuration = document.querySelector("configuration");
            configuration?.setAttribute("name", "start");
            const command = document.querySelector("command");
            command?.setAttribute("value", "start");
            return {destPath: resolve(project.path, ".idea", "start.xml")};
        });
    } else {
        return {type: "success"};
    }
}
