import {format} from "prettier-package-json";

export function formatPackageJson(json: object): string {
    return format(json, {
        keyOrder: [
            "private",
            "name",
            "version",
            "description",
            "keywords",
            "author",
            "maintainers",
            "contributors",
            "homepage",
            "bugs",
            "repository",
            "license",
            "type",
            "scripts",
            "main",
            "module",
            "browser",
            "man",
            "preferGlobal",
            "bin",
            "files",
            "directories",
            "sideEffects",
            "types",
            "typings",
            "engines",
            "engine-strict",
            "engineStrict",
            "os",
            "cpu",
            "dependencies",
            "optionalDependencies",
            "bundleDependencies",
            "bundledDependencies",
            "peerDependencies",
            "devDependencies",
            "eslintConfig",
            "prettier",
            "config",
            "ava",
            "release"
        ] as any[]
    });
}
