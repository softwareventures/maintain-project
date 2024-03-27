import {format} from "prettier-package-json";
import type {PackageJson, PackageJsonKey} from "prettier-package-json/build/types";

export function formatPackageJson(json: PackageJson): string {
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
            "exports",
            "types",
            "typings",
            "typesVersions",
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
        ] as unknown as PackageJsonKey[]
    });
}
