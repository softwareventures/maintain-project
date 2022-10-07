import type {ProjectSource} from "../project/project";
import type {Result} from "../result/result";
import {mapFailureFn} from "../result/result";
import {yarn} from "./yarn";

export type YarnPluginImportResult = Result<YarnPluginImportFailureReason>;

export interface YarnPluginImportFailureReason {
    readonly type: "yarn-plugin-import-failed";
}

export async function yarnPluginImportTypeScript(
    project: ProjectSource
): Promise<YarnPluginImportResult> {
    return yarn(project, "plugin", "import", "typescript").then(
        mapFailureFn((): YarnPluginImportFailureReason => ({type: "yarn-plugin-import-failed"}))
    );
}
