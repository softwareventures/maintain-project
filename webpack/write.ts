import * as escodegen from "escodegen";
import {Program} from "estree";
import {textFile} from "../fs-stage/file";
import {FsStage, insert, InsertResult} from "../fs-stage/fs-stage";
import {success} from "../result/result";
import {Project} from "../project/project";

export function writeWebpackConfig(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    if (project.target !== "webapp") {
        return async fsStage => success(fsStage);
    }

    const program: Program = {
        type: "Program",
        sourceType: "module",
        body: [
            {
                type: "ExpressionStatement",
                expression: {
                    type: "Literal",
                    value: "use strict"
                }
            },
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
    const file = textFile(text);

    return async fsStage => insert(fsStage, "webpack.config.cjs", file);
}
