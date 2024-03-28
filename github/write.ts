import {last, map} from "@softwareventures/array";
import {notNull} from "@softwareventures/nullable";
import yaml from "yaml";
import type {FsStage, InsertResult} from "../fs-stage/fs-stage.js";
import {insert} from "../fs-stage/fs-stage.js";
import {modifyTemplateYaml} from "../template/modify-yaml.js";
import type {Project} from "../project/project.js";
import {looseSort} from "../semver/loose-sort.js";
import {projectTemplateId} from "../template/project-template-id.js";

export function writeGitHubConfig(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    return async fsStage =>
        modifyTemplateYaml({
            templateId: projectTemplateId(project),
            pathSegments: [".github", "workflows", "ci.yml"],
            modify: workflow => {
                workflow.getIn([
                    "jobs",
                    "build-and-test",
                    "strategy",
                    "matrix",
                    "node-version"
                    // FIXME
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                ]).items = map(project.node.testedVersions, version => `${version}.x`);
                workflow.setIn(
                    ["env", "DEPLOY_NODE_VERSION"],
                    `${notNull(last(looseSort(project.node.currentReleases)))}.x`
                );
                const deployJob = {deploy: workflow.getIn(["jobs", "deploy"]) as unknown};
                workflow.deleteIn(["jobs", "deploy"]);
                // FIXME
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                workflow.getIn(["jobs"]).comment = yaml.stringify(deployJob).trim();
                return workflow;
            }
        }).then(file => insert(fsStage, ".github/workflows/ci.yml", file));
}
