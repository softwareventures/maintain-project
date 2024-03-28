import test from "ava";
import {nodeVersionRange} from "./version-range.js";

test("nodeVersionRange", t => {
    t.is(nodeVersionRange(["12", "14", "15", "16"]), "^12 || ^14 || ^15 || >=16");
});
