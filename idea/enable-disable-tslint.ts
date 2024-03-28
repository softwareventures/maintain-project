import {sep} from "path";
import {mapNullableFn, mapNullFn} from "@softwareventures/nullable";
import {first, tail} from "@softwareventures/array";
import type {Project} from "../project/project.js";
import type {FsStageUpdate} from "../project/update.js";
import {readProjectXml} from "../project/read-xml.js";
import {toAsyncNullable} from "../result/result.js";
import {readTemplateXml} from "../template/read-xml.js";
import {projectTemplateId} from "../template/project-template-id.js";
import {insert} from "../fs-stage/fs-stage.js";
import {textFile} from "../fs-stage/file.js";
import {formatIdeaXml} from "./format-idea-xml.js";

export async function enableDisableIdeaTslintInspection(
    project: Project
): Promise<FsStageUpdate | null> {
    const inspectionProfiles = toAsyncNullable(
        readProjectXml(project, `.idea${sep}inspectionProfiles${sep}Project_Default.xml`)
    );
    const hasTslintInspection = inspectionProfiles
        .then(
            mapNullableFn(dom =>
                dom.window.document.querySelector(
                    "component:root>profile>inspection_tool[class=TsLint][enabled=true]"
                )
            )
        )
        .then(element => element != null);
    const needsChange = hasTslintInspection.then(
        hasTslintInspection => hasTslintInspection !== (project.tslint != null)
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
                    "component:root>profile>inspection_tool[class=TsLint]"
                );
                tail(tools).forEach(tool => void tool.remove());
                const tool = first(tools);
                if (project.tslint == null) {
                    tool?.remove();
                } else if (tool == null) {
                    const profile = dom.window.document.querySelector("component:root>profile");
                    if (profile == null) {
                        return null;
                    }
                    const newTool = dom.window.document.createElement("inspection_tool");
                    newTool.setAttribute("class", "TsLint");
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
                project.tslint == null ? "disable" : "enable"
            } tslint inspection`,
            apply: async stage =>
                insert(stage, ".idea/inspectionProfiles/Project_Default.xml", textFile(text))
        }))
    );
}
