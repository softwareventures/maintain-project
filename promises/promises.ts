export function catchIf<T, U>(
    predicate: (reason: any) => reason is U,
    f: (reason: U) => T | Promise<T>
): (reason: any) => T | Promise<T>;
export function catchIf<T>(
    predicate: (reason: any) => boolean,
    f: (reason: any) => T | Promise<T>
): (reason: any) => T | Promise<T>;
export function catchIf<T>(
    predicate: (reason: any) => boolean,
    f: (reason: any) => T | Promise<T>
): (reason: any) => T | Promise<T> {
    return reason => {
        if (predicate(reason)) {
            return f(reason);
        } else {
            throw reason;
        }
    };
}
