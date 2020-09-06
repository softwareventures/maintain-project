import {promises as fs} from "fs";
import {resolve} from "path";
import {JSDOM} from "jsdom";
import nonNull from "non-null";
import {Result} from "../../task/result";
import {Project} from "../project";

export async function writeIdeaModulesXml(project: Project): Promise<Result> {
    const sourcePath = require.resolve("./template/idea.template/modules.xml");
    const destPath = resolve(project.path, ".idea", "modules.xml");

    const xmlText = fs.readFile(sourcePath, "utf8");
    const dom = xmlText.then(xmlText => new JSDOM(xmlText, {contentType: "application/xml"}));
    const document = dom.then(dom => dom.window.document);

    const module = document
        .then(document => document.querySelector("project:root>component>modules>module"))
        .then(nonNull);

    const newXmlText = module
        .then(module => {
            module.setAttribute(
                "fileurl",
                nonNull(module.getAttribute("fileurl")).replace(
                    /create-project\.iml$/,
                    project.npmPackage.name + ".iml"
                )
            );
            module.setAttribute(
                "filepath",
                nonNull(module.getAttribute("filepath")).replace(
                    /create-project\.iml$/,
                    project.npmPackage.name + ".iml"
                )
            );
        })
        .then(async () => dom)
        .then(dom => dom.serialize());

    return newXmlText
        .then(async newXmlText =>
            fs.writeFile(destPath, newXmlText, {encoding: "utf8", flag: "wx"})
        )
        .then(
            () => ({type: "success"}),
            reason => {
                if (reason.code === "EEXIST") {
                    return {type: "not-empty"};
                } else {
                    throw reason;
                }
            }
        );
}
