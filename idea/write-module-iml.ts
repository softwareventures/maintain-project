import {FsStage, insert, InsertResult} from "../fs-stage/fs-stage";
import {modifyTemplateXml} from "../template/modify-xml";
import {Project} from "../project/project";
import {projectTemplateId} from "../template/project-template-id";

export function writeIdeaModuleIml(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    const imlFilename =
        project.target === "webapp" ? "template-webpack-project.iml" : "template-node-project.iml";
    const file = modifyTemplateXml({
        templateId: projectTemplateId(project),
        pathSegments: [".idea", imlFilename],
        modify: dom => {
            const document = dom.window.document;

            const excludeFolder = document.querySelector(
                'module:root>component[name=NewModuleRootManager]>content>excludeFolder[url="file://$MODULE_DIR$/template/template"]'
            );
            excludeFolder?.parentNode?.removeChild(excludeFolder);

            return dom;
        }
    });

    return async fsStage =>
        file.then(file => insert(fsStage, `.idea/${project.npmPackage.name}.iml`, file));
}
