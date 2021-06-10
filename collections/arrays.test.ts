import test from "ava";
import {excludeIndex, findExtract} from "./arrays";

test("findExtract", t => {
    t.deepEqual(
        findExtract(["a", "b", "c", "b"], c => c === "b"),
        ["b", ["a", "c", "b"]]
    );
});

test("excludeIndex", t => {
    t.deepEqual(excludeIndex(["a", "b", "c", "b"], 1), ["a", "c", "b"]);
});
