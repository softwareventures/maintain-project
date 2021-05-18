import test from "ava";
import {nodeVersionRange} from "./version-range";

test("nodeVersionRange", t => {
    t.is(nodeVersionRange({versions: ["12", "14", "15", "16"]}), "^12 || ^14 || ^15 || >=16");
});
