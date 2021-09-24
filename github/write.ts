import {last, map} from "@softwareventures/array";
import {notNull} from "@softwareventures/nullable";
import {FsStage, insert, InsertResult} from "../fs-stage/fs-stage";
import {modifyTemplateYaml} from "../template/modify-yaml";
import {Project} from "../project/project";
import {looseSort} from "../semver/loose-sort";

export function writeGitHubConfig(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    return async fsStage =>
        modifyTemplateYaml("github.template/workflows/ci.yml", workflow => {
            workflow.getIn(["jobs", "build-and-test", "strategy", "matrix", "node-version"]).items =
                map(project.node.testedVersions, version => `${version}.x`);
            workflow.setIn(
                ["env", "DEPLOY_NODE_VERSION"],
                `${notNull(last(looseSort(project.node.currentReleases)))}.x`
            );
            return workflow;
        }).then(file => insert(fsStage, ".github/workflows/ci.yml", file));
}
