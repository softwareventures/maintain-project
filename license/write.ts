import spdxLicenseList = require("spdx-license-list/full");
import {Project} from "../project/project";
import {FsStage, insert, InsertResult} from "../fs-stage/fs-stage";
import {success} from "../result/result";
import {textFile} from "../fs-stage/file";

export function writeLicense(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    const licenseExpression = project.license?.spdxLicense;

    if (
        licenseExpression == null ||
        "operator" in licenseExpression ||
        "invalidText" in licenseExpression
    ) {
        return async fsStage => success(fsStage);
    }

    const text = spdxLicenseList[licenseExpression.licenseId]?.licenseText;

    if (text == null) {
        return async fsStage => success(fsStage);
    }

    const file = textFile(
        `Copyright ${project.license.year} ${project.license.copyrightHolder ?? ""}`.trim() +
            "\n\n" +
            text
    );

    return async fsStage => insert(fsStage, "LICENSE.md", file);
}
