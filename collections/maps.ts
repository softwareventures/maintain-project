export function copy<T, U>(map: ReadonlyMap<T, U>): Map<T, U> {
    return new Map(map);
}
