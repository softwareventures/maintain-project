import {FsStage, insert, InsertResult} from "../../fs-stage/fs-stage";
import {modifyXml} from "../../template/modify-xml";
import {Project} from "../project";

export function writeIdeaModulesXml(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    const file = modifyXml("idea.template/modules.xml", dom => {
        const document = dom.window.document;

        const module = document.querySelector("project:root>component>modules>module");
        const fileUrl = module
            ?.getAttribute("fileurl")
            ?.replace(/maintain-project\.iml$/, `${project.npmPackage.name}.iml`);
        if (fileUrl != null) {
            module?.setAttribute("fileurl", fileUrl);
        }
        const filePath = module
            ?.getAttribute("filepath")
            ?.replace(/maintain-project\.iml$/, `${project.npmPackage.name}.iml`);
        if (filePath != null) {
            module?.setAttribute("filepath", filePath);
        }

        return dom;
    });

    return async fsStage => file.then(file => insert(fsStage, ".idea/modules.xml", file));
}
