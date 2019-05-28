// Type definitions for prettier-package-json 2.1
// Project: https://github.com/cameronhunter/prettier-package-json
// Definitions by: Daniel Cassidy <https://github.com/djcsdy>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module "prettier-package-json" {
    export type CompareFn = (a: string, b: string) => number;

    export interface Options {
        tabWidth?: number;
        useTabs?: boolean;
        expandUsers?: boolean;
        keyOrder?: ReadonlyArray<string> | CompareFn;
    }

    export function format(json: object, options?: Options): string;

    export function check(json: string | object, options?: Options): boolean;
}