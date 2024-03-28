import {promises as fs} from "fs";
import {fileURLToPath} from "url";
import spdxLicenseList from "spdx-license-list/full.js";
import {mapNullableFn, mapNullFn} from "@softwareventures/nullable";
import type {Project} from "../project/project.js";
import type {FsStage, InsertResult} from "../fs-stage/fs-stage.js";
import {insert} from "../fs-stage/fs-stage.js";
import {success} from "../result/result.js";
import {textFile} from "../fs-stage/file.js";

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
            return fs.readFile(fileURLToPath(import.meta.resolve("./LICENSE.ISC.md")), "utf-8");
        default:
            return spdxLicenseList[licenseId]?.licenseText ?? null;
    }
}
