import {basename, extname, isAbsolute, relative, sep} from "path";
import {Legacy} from "@eslint/eslintrc";
import {mapNullableFn} from "@softwareventures/nullable";
import {hasProperty} from "unknown";
import {contains, isArray} from "@softwareventures/array";
import {projectDevDependsOn} from "../project/dev-depends-on";
import {ProjectSource} from "../project/project";
import {readProjectJson} from "../project/read-json";
import {toAsyncNullable} from "../result/result";
import {readProjectYaml} from "../project/read-yaml";
import {EslintProject} from "./eslint-project";

export async function readEslintProject(
    project: ProjectSource
): Promise<EslintProject | undefined> {
    const readPackageJsonConfigFile = async (relativePath: string): Promise<unknown> =>
        toAsyncNullable(readProjectJson(project, relativePath)).then(
            mapNullableFn(json => (hasProperty(json, "eslintConfig") ? json.eslintConfig : null))
        );

    const readJsonConfigFile = async (relativePath: string): Promise<unknown> =>
        toAsyncNullable(readProjectJson(project, relativePath));

    const readYamlConfigFile = async (relativePath: string): Promise<unknown> =>
        toAsyncNullable(readProjectYaml(project, relativePath));

    const readConfigFile = async (relativePath: string): Promise<unknown> => {
        switch (extname(relativePath)) {
            case ".js":
            case ".cjs":
                return null; // Unsupported
            case ".json":
                if (basename(relativePath) === "package.json") {
                    return readPackageJsonConfigFile(relativePath);
                } else {
                    return readJsonConfigFile(relativePath);
                }
            default:
                return readYamlConfigFile(relativePath);
        }
    };

    if (!(await projectDevDependsOn(project, "eslint"))) {
        return undefined;
    }

    const dependsOnSoftwareVenturesPreset = projectDevDependsOn(
        project,
        "@softwareventures/eslint-config"
    );
    const configPath = Legacy.ConfigArrayFactory.getPathToConfigFileInDirectory(project.path);
    if (configPath == null) {
        return undefined;
    }
    const relativeConfigPath = relative(project.path, configPath);
    if (isAbsolute(relativeConfigPath) || (relativeConfigPath.split(sep)[0] ?? "") === "..") {
        return undefined;
    }
    const config = await readConfigFile(relativeConfigPath);

    if (
        (await dependsOnSoftwareVenturesPreset) &&
        config != null &&
        hasProperty(config, "extends") &&
        ((isArray(config.extends) && contains(config.extends, "@softwareventures")) ||
            config.extends === "@softwareventures")
    ) {
        return {preset: "softwareventures"};
    } else {
        return {preset: "other"};
    }
}
