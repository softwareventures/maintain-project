import {resolve} from "path";
import {modifyXml} from "../../task/modify-xml";
import {Result} from "../../task/result";
import {Project} from "../project";

export async function writeIdeaModuleIml(project: Project): Promise<Result> {
    return modifyXml("idea.template/create-project.iml", document => {
        const excludeFolder = document.querySelector(
            'module:root>component[name=NewModuleRootManager]>content>excludeFolder[url="file://$MODULE_DIR$/template"]'
        );
        excludeFolder?.parentNode?.removeChild(excludeFolder);

        return {destPath: resolve(project.path, ".idea", `${project.npmPackage.name}.iml`)};
    });
}
