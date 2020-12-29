import {FsChangeset, insert, InsertResult} from "../../fs-changeset/fs-changeset";
import {modifyXml} from "../../template/modify-xml";
import {Project} from "../project";

export function writeIdeaModuleIml(
    project: Project
): (fsChangeset: FsChangeset) => Promise<InsertResult> {
    const file = modifyXml("idea.template/maintain-project.iml", dom => {
        const document = dom.window.document;

        const excludeFolder = document.querySelector(
            'module:root>component[name=NewModuleRootManager]>content>excludeFolder[url="file://$MODULE_DIR$/template"]'
        );
        excludeFolder?.parentNode?.removeChild(excludeFolder);

        return dom;
    });

    return async fsChangeset =>
        file.then(file => insert(fsChangeset, `.idea/${project.npmPackage.name}.iml`, file));
}
