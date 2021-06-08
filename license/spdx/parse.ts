import {first, tail} from "@softwareventures/array";
import {scanSpdxExpression, SpdxToken} from "./scan";
import {
    CombinationOperator,
    CompoundExpression,
    SimpleExpression,
    SpdxLicense,
    WithExpression
} from "./spdx";

export function parseSpdxExpression(text: string): SpdxLicense {
    const tokens = scanSpdxExpression(text);
    const [expression, rest] = parseCompoundExpression(tokens);
    if (expression == null || rest.length !== 0) {
        return {invalidText: text};
    } else {
        return expression;
    }
}

function parseCompoundExpression(
    tokens: readonly SpdxToken[]
): [CompoundExpression | null, readonly SpdxToken[]] {
    return parseOperatorExpression(tokens, "OR", tokens =>
        parseOperatorExpression(tokens, "AND", parseAtom)
    );
}

function parseOperatorExpression(
    tokens: readonly SpdxToken[],
    operator: CombinationOperator,
    next: (tokens: readonly SpdxToken[]) => [CompoundExpression | null, readonly SpdxToken[]]
): [CompoundExpression | null, readonly SpdxToken[]] {
    const [left, tokens2] = next(tokens);
    if (left == null) {
        return [null, tokens];
    }

    if (first(tokens2)?.type !== operator) {
        return [left, tokens2];
    }

    const [right, tokens3] = next(tail(tokens2));

    if (right == null) {
        return [null, tokens];
    }

    return [{left, operator, right}, tokens3];
}

function parseAtom(
    tokens: readonly SpdxToken[]
): [CompoundExpression | null, readonly SpdxToken[]] {
    const [parenthesizedExpression, tokens2] = parseParenthesizedExpression(tokens);
    if (parenthesizedExpression != null) {
        return [parenthesizedExpression, tokens2];
    }

    const [licenseExpression, tokens3] = parseLicenseReferenceExpression(tokens);
    if (licenseExpression != null) {
        return [licenseExpression, tokens3];
    }

    return [null, tokens];
}

function parseParenthesizedExpression(
    tokens: readonly SpdxToken[]
): [CompoundExpression | null, readonly SpdxToken[]] {
    if (first(tokens)?.type !== "(") {
        return [null, tokens];
    }

    const [expression, tokens2] = parseCompoundExpression(tail(tokens));

    if (first(tokens2)?.type !== ")") {
        return [null, tokens];
    }

    return [expression, tokens2];
}

function parseLicenseReferenceExpression(
    tokens: readonly SpdxToken[]
): [SimpleExpression | WithExpression | null, readonly SpdxToken[]] {
    const identifier = first(tokens);
    if (identifier?.type !== "identifier") {
        return [null, tokens];
    }

    const tokens2 = tail(tokens);
    const plus = first(tokens2)?.type === "+";
    const tokens3 = plus ? tail(tokens2) : tokens2;

    if (first(tokens3)?.type !== "WITH") {
        return [{licenseId: identifier.text, plus}, tokens3];
    }

    const tokens4 = tail(tokens3);
    const exceptionIdentifier = first(tokens4);
    if (exceptionIdentifier?.type !== "identifier") {
        return [null, tokens];
    }

    return [
        {licenseId: identifier.text, plus, exceptionId: exceptionIdentifier.text},
        tail(tokens4)
    ];
}
