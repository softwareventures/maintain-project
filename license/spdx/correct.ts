import spdxCorrect = require("spdx-correct");
import {SpdxLicense} from "./spdx";
import {parseSpdxExpression} from "./parse";
import {formatSpdxExpression} from "./format";

export function parseAndCorrectSpdxExpression(text: string): SpdxLicense {
    return correctSpdxLicense(parseSpdxExpression(text));
}

export function correctSpdxLicense(license: SpdxLicense): SpdxLicense {
    if ("operator" in license) {
        return {
            left: correctSpdxLicense(license.left),
            operator: license.operator,
            right: correctSpdxLicense(license.right)
        };
    } else {
        const correctedExpression = spdxCorrect(formatSpdxExpression(license));
        if (correctedExpression == null) {
            return license;
        } else {
            return parseSpdxExpression(correctedExpression);
        }
    }
}
