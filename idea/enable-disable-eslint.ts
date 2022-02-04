import {sep} from "path";
import {mapNullableFn, mapNullFn} from "@softwareventures/nullable";
import {first, tail} from "@softwareventures/array";
import {Project} from "../project/project";
import {toAsyncNullable} from "../result/result";
import {readProjectXml} from "../project/read-xml";
import {readTemplateXml} from "../template/read-xml";
import {projectTemplateId} from "../template/project-template-id";
import {insert} from "../fs-stage/fs-stage";
import {textFile} from "../fs-stage/file";
import {FsStageUpdate} from "../project/update";
import {formatIdeaXml} from "./format-idea-xml";

export async function enableDisableIdeaEslintInspection(
    project: Project
): Promise<FsStageUpdate | null> {
    const inspectionProfiles = toAsyncNullable(
        readProjectXml(project, `.idea${sep}inspectionProfiles${sep}Project_Default.xml`)
    );
    const hasEslintInspection = inspectionProfiles
        .then(
            mapNullableFn(dom =>
                dom.window.document.querySelector(
                    "component:root>profile>inspection_tool[class=Eslint][enabled=true]"
                )
            )
        )
        .then(element => element != null);
    const needsChange = hasEslintInspection.then(
        hasEslintInspection => hasEslintInspection !== (project.eslint != null)
    );
    const newInspectionProfiles = needsChange
        .then(async needsChange => (needsChange ? inspectionProfiles : false))
        .then(
            mapNullFn(async () =>
                readTemplateXml(
                    projectTemplateId(project),
                    ".idea",
                    "inspectionProfiles",
                    "Project_Default.xml"
                )
            )
        )
        .then(dom => (dom === false ? null : dom))
        .then(
            mapNullableFn(dom => {
                const tools = dom.window.document.querySelectorAll(
                    "component:root>profile>inspection_tool[class=Eslint]"
                );
                tail(tools).forEach(tool => tool.remove());
                const tool = first(tools);
                if (project.eslint == null) {
                    tool?.remove();
                } else if (tool == null) {
                    const profile = dom.window.document.querySelector("component:root>profile");
                    if (profile == null) {
                        return null;
                    }
                    const newTool = dom.window.document.createElement("inspection_tool");
                    newTool.setAttribute("class", "Eslint");
                    newTool.setAttribute("enabled", "true");
                    newTool.setAttribute("level", "WARNING");
                    newTool.setAttribute("enabled_by_default", "true");
                    profile.appendChild(newTool);
                } else {
                    tool.setAttribute("enabled", "true");
                    tool.setAttribute("enabled_by_default", "true");
                }

                return dom;
            })
        )
        .then(mapNullableFn(formatIdeaXml));

    return newInspectionProfiles.then(
        mapNullableFn(text => ({
            type: "fs-stage-update",
            log: `chore(webstorm): ${
                project.eslint == null ? "disable" : "enable"
            } eslint inspection`,
            apply: async stage =>
                insert(stage, ".idea/inspectionProfiles/Project_Default.xml", textFile(text))
        }))
    );
}
