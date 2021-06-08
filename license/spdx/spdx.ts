export type SpdxLicense = CompoundExpression | InvalidText;

export type CompoundExpression = SimpleExpression | WithExpression | CombinationExpression;

export interface SimpleExpression {
    readonly licenseId: string;
    readonly plus: boolean;
}

export interface WithExpression extends SimpleExpression {
    readonly exceptionId: string;
}

export interface CombinationExpression {
    readonly left: SpdxLicense;
    readonly operator: CombinationOperator;
    readonly right: SpdxLicense;
}

export type CombinationOperator = "AND" | "OR";

export const combinationOperatorPrecedence: readonly CombinationOperator[] = ["AND", "OR"];

export interface InvalidText {
    readonly invalidText: string;
}
