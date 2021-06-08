import spdxLicenseList = require("spdx-license-list/full");
import {mapNullableFn, mapNullFn} from "@softwareventures/nullable";
import {Project} from "../project/project";
import {FsStage, insert, InsertResult} from "../fs-stage/fs-stage";
import {success} from "../result/result";
import {textFile} from "../fs-stage/file";
import {readTemplateText} from "../template/read-text";

export function writeLicense(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    const licenseExpression = project.license?.spdxLicense;

    if (
        licenseExpression == null ||
        "operator" in licenseExpression ||
        "invalidText" in licenseExpression
    ) {
        return async fsStage => success(fsStage);
    }

    const text = readLicenseText(licenseExpression.licenseId);

    const file = text.then(
        mapNullableFn(text =>
            textFile(
                `Copyright ${project.license.year} ${
                    project.license.copyrightHolder ?? ""
                }`.trim() +
                    "\n\n" +
                    text
            )
        )
    );

    return async fsStage =>
        file
            .then(mapNullableFn(file => insert(fsStage, "LICENSE.md", file)))
            .then(mapNullFn(() => success(fsStage)));
}

async function readLicenseText(licenseId: string): Promise<string | null> {
    switch (licenseId) {
        case "ISC":
            return readTemplateText("LICENSE.ISC.md");
        default:
            return spdxLicenseList[licenseId]?.licenseText ?? null;
    }
}
