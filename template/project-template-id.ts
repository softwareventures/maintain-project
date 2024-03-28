import type {Project} from "../project/project.js";
import type {TemplateId} from "./template.js";

export function projectTemplateId(project: Pick<Project, "target">): TemplateId {
    switch (project.target) {
        case "npm":
            return "node";
        case "webapp":
            return "webpack";
    }
}
