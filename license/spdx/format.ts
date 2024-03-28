import type {CombinationOperator, SpdxLicense} from "./spdx.js";
import {combinationOperatorPrecedence} from "./spdx.js";

export function formatSpdxExpression(license: SpdxLicense): string {
    return formatSpdxExpressionInternal(license, null);
}

function formatSpdxExpressionInternal(
    license: SpdxLicense,
    parentOperator: CombinationOperator | null
): string {
    if ("invalidText" in license) {
        return license.invalidText;
    } else if ("operator" in license) {
        if (
            parentOperator != null &&
            combinationOperatorPrecedence.indexOf(license.operator) >
                combinationOperatorPrecedence.indexOf(parentOperator)
        ) {
            return `(${formatSpdxExpressionInternal(license, null)})`;
        } else {
            return (
                formatSpdxExpressionInternal(license.left, license.operator) +
                " " +
                license.operator +
                " " +
                formatSpdxExpressionInternal(license.right, license.operator)
            );
        }
    } else {
        return (
            license.licenseId +
            (license.plus ? "+" : "") +
            ("exceptionId" in license ? ` WITH ${license.exceptionId}` : "")
        );
    }
}
