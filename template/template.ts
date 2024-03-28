import {dirname, resolve, sep} from "path";
import {fileURLToPath} from "url";
import {map} from "@softwareventures/array";

export type TemplateId = keyof typeof templates;

export const templates = {
    node: "@softwareventures/template-node-project",
    webpack: "@softwareventures/template-webpack-project"
} as const;

export function templatePath(id: TemplateId, ...pathSegments: string[]): string {
    return resolve(
        dirname(fileURLToPath(import.meta.resolve(`${templates[id]}/package.json`))),
        ...map(pathSegments, segment => segment.replace("/", sep))
    );
}
