import type {FsStage, InsertResult} from "../fs-stage/fs-stage";
import {insert} from "../fs-stage/fs-stage";
import {modifyTemplateXml} from "../template/modify-xml";
import type {Project} from "../project/project";
import {projectTemplateId} from "../template/project-template-id";

export function writeIdeaModulesXml(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    const file = modifyTemplateXml({
        templateId: projectTemplateId(project),
        pathSegments: [".idea", "modules.xml"],
        modify: dom => {
            const document = dom.window.document;

            const module = document.querySelector("project:root>component>modules>module");
            const fileUrl = module
                ?.getAttribute("fileurl")
                ?.replace(/[^/]*\.iml$/u, `${project.npmPackage.name}.iml`);
            if (fileUrl != null) {
                module?.setAttribute("fileurl", fileUrl);
            }
            const filePath = module
                ?.getAttribute("filepath")
                ?.replace(/[^/]*\.iml$/u, `${project.npmPackage.name}.iml`);
            if (filePath != null) {
                module?.setAttribute("filepath", filePath);
            }

            return dom;
        }
    });

    return async fsStage => file.then(file => insert(fsStage, ".idea/modules.xml", file));
}
