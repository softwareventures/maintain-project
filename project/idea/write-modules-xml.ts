import {resolve} from "path";
import {modifyXml} from "../../task/modify-xml";
import {Result} from "../../task/result";
import {Project} from "../project";

export async function writeIdeaModulesXml(project: Project): Promise<Result> {
    return modifyXml("idea.template/modules.xml", document => {
        const module = document.querySelector("project:root>component>modules>module");
        const fileUrl = module
            ?.getAttribute("fileurl")
            ?.replace(/create-project\.iml$/, `${project.npmPackage.name}.iml`);
        if (fileUrl != null) {
            module?.setAttribute("fileurl", fileUrl);
        }
        const filePath = module
            ?.getAttribute("filepath")
            ?.replace(/create-project\.iml$/, `${project.npmPackage.name}.iml`);
        if (filePath != null) {
            module?.setAttribute("filepath", filePath);
        }

        return {destPath: resolve(project.path, ".idea", "modules.xml")};
    });
}
