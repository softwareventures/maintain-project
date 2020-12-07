export function catchIf<T, U = any>(
    predicate: (reason: any) => reason is U,
    f: (reason: U) => T
): (reason: any) => T {
    return reason => {
        if (predicate(reason)) {
            return f(reason);
        } else {
            throw reason;
        }
    };
}
