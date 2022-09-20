import chain from "@softwareventures/chain";
import {foldFn, initial, push} from "@softwareventures/array";

export function resolvePathSegments(path: string): readonly string[] | null {
    return chain(path)
        .map(path => path.replace(/^\/*/u, ""))
        .map(path => path.replace(/\/*$/u, ""))
        .map(path => path.split(/\/+/u))
        .map(
            foldFn(
                (resolved, segment) =>
                    resolved == null
                        ? null
                        : segment === "."
                        ? resolved
                        : segment === ".." && resolved.length > 0
                        ? initial(resolved)
                        : segment === ".."
                        ? null
                        : push(resolved, segment),
                [] as readonly string[] | null
            )
        ).value;
}
