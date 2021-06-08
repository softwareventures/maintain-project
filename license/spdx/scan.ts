export interface SpdxToken {
    readonly type: "AND" | "OR" | "WITH" | "(" | ")" | "+" | "identifier";
    readonly text: string;
}

export function scanSpdxExpression(text: string): SpdxToken[] {
    return text
        .trim()
        .split(/\s+|(?=[+()])|(?<=[+()])/)
        .map(tokenOf);
}

function tokenOf(text: string): SpdxToken {
    if (
        text === "AND" ||
        text === "OR" ||
        text === "WITH" ||
        text === "(" ||
        text === ")" ||
        text === "+"
    ) {
        return {type: text, text};
    } else {
        return {type: "identifier", text};
    }
}
