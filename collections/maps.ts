export function copy<T, U>(map: ReadonlyMap<T, U>): Map<T, U> {
    return new Map(map);
}

export function insert<T, U>(map: ReadonlyMap<T, U>, key: T, value: U): Map<T, U> {
    return copy(map).set(key, value);
}
