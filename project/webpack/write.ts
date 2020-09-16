import {resolve} from "path";
import {Program} from "estree";
import * as escodegen from "escodegen";
import {Result} from "../../task/result";
import {writeFile} from "../../task/write-file";
import {Project} from "../project";

export async function writeWebpackConfig(project: Project): Promise<Result> {
    if (project.target !== "webapp") {
        return {type: "success"};
    }

    const program: Program = {
        type: "Program",
        sourceType: "module",
        body: [
            {
                type: "VariableDeclaration",
                kind: "const",
                declarations: [
                    {
                        type: "VariableDeclarator",
                        id: {type: "Identifier", name: "config"},
                        init: {
                            type: "CallExpression",
                            callee: {type: "Identifier", name: "require"},
                            arguments: [
                                {type: "Literal", value: "@softwareventures/webpack-config"}
                            ],
                            optional: false
                        }
                    }
                ]
            },
            {
                type: "ExpressionStatement",
                expression: {
                    type: "AssignmentExpression",
                    operator: "=",
                    left: {
                        type: "MemberExpression",
                        object: {type: "Identifier", name: "module"},
                        property: {type: "Identifier", name: "exports"},
                        computed: false,
                        optional: false
                    },
                    right: {
                        type: "CallExpression",
                        callee: {type: "Identifier", name: "config"},
                        arguments: [
                            {
                                type: "ObjectExpression",
                                properties: [
                                    {
                                        type: "Property",
                                        method: false,
                                        shorthand: false,
                                        computed: false,
                                        key: {type: "Identifier", name: "title"},
                                        value: {type: "Literal", value: project.npmPackage.name},
                                        kind: "init"
                                    }
                                ]
                            }
                        ],
                        optional: false
                    }
                }
            }
        ]
    };

    const text = escodegen.generate(program);

    return writeFile(resolve(project.path, "webpack.config.js"), text);
}