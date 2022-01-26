import {Project} from "../project/project";
import {TemplateId} from "./template";

export function projectTemplateId(project: Pick<Project, "target">): TemplateId {
    switch (project.target) {
        case "npm":
            return "node";
        case "webapp":
            return "webpack";
    }
}
