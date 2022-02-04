import {JSDOM} from "jsdom";
import formatXml = require("xml-formatter");

export function formatIdeaXml(dom: JSDOM): string {
    return formatXml(dom.serialize(), {
        collapseContent: true,
        indentation: "  ",
        stripComments: true,
        whiteSpaceAtEndOfSelfclosingTag: true
    });
}
