// Type definitions for empty-dir 2.0
// Project: https://github.com/gulpjs/empty-dir
// Definitions by: BendingBender <https://github.com/BendingBender>
//                 Daniel Cassidy <https://github.com/djcsdy>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/// <reference types="node" />

declare module "empty-dir" {
    export = emptyDir;

    function emptyDir(
        dir: string,
        cb: (err: NodeJS.ErrnoException, isEmpty: boolean) => void
    ): void;
    function emptyDir(
        dir: string,
        filter: (path: string) => boolean,
        cb: (err: NodeJS.ErrnoException, isEmpty: boolean) => void
    ): void;
    function emptyDir(
        dir: string,
        filter?: (path: string) => boolean
    ): Promise<boolean>;

    namespace emptyDir {
        function sync(dir: string, filter?: (path: string) => boolean): boolean;
    }
}