import {EOL} from "os";
import type {JSDOM} from "jsdom";
import formatXml from "xml-formatter";

export function formatIdeaXml(dom: JSDOM): string {
    return formatXml(dom.serialize(), {
        collapseContent: true,
        lineSeparator: EOL,
        indentation: "  ",
        stripComments: true,
        whiteSpaceAtEndOfSelfclosingTag: true
    });
}
