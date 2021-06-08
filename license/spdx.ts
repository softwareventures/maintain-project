import {Info, ConjuctionInfo} from "spdx-expression-parse";
import spdxCorrect = require("spdx-correct");
import parse = require("spdx-expression-parse");

export type SpdxLicense = Info;

export function parseSpdxExpression(text: string): SpdxLicense {
    return parse(text);
}

export function parseAndCorrectSpdxExpression(text: string): SpdxLicense {
    return correctSpdxLicense(parse(text));
}

export function correctSpdxLicense(license: SpdxLicense): SpdxLicense {
    if ("conjunction" in license) {
        return {
            conjunction: license.conjunction,
            left: correctSpdxLicense(license.left),
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

export function formatSpdxExpression(license: SpdxLicense): string {
    return formatSpdxExpressionInternal(license, null);
}

type Operator = ConjuctionInfo["conjunction"];

function formatSpdxExpressionInternal(
    license: SpdxLicense,
    parentOperator: Operator | null
): string {
    if ("conjunction" in license) {
        if (
            parentOperator != null &&
            operatorPrecedence.indexOf(license.conjunction) >
                operatorPrecedence.indexOf(parentOperator)
        ) {
            return `(${formatSpdxExpressionInternal(license, null)})`;
        } else {
            return (
                formatSpdxExpressionInternal(license.left, license.conjunction) +
                " " +
                license.conjunction.toUpperCase() +
                " " +
                formatSpdxExpressionInternal(license.right, license.conjunction)
            );
        }
    } else {
        return license.license + (license.plus ? "+" : "");
    }
}

const operatorPrecedence: readonly Operator[] = ["and", "or"];
