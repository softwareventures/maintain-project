import {toArray, concatMap, zip} from "@softwareventures/iterable";
import type {Result} from "../result/result";
import {failure, isSuccess, success} from "../result/result";

export function copy<T, U>(map: ReadonlyMap<T, U>): Map<T, U> {
    return new Map(map);
}

export function empty<T, U>(map: ReadonlyMap<T, U>): boolean {
    return map.size === 0;
}

export function mapValue<T, U, V>(map: ReadonlyMap<T, U>, f: (value: U, key: T) => V): Map<T, V> {
    const result = new Map<T, V>();
    for (const [key, value] of map.entries()) {
        result.set(key, f(value, key));
    }
    return result;
}

export function mapValueFn<T, U, V>(
    f: (value: U, key: T) => V
): (map: ReadonlyMap<T, U>) => Map<T, V> {
    return map => mapValue(map, f);
}

export function partitionValue<TKey, TValue, TValue2 extends TValue>(
    map: ReadonlyMap<TKey, TValue>,
    predicate: (value: TValue) => value is TValue2
): [Map<TKey, TValue2>, Map<TKey, Exclude<TValue, TValue2>>];
export function partitionValue<TKey, TValue>(
    map: ReadonlyMap<TKey, TValue>,
    predicate: (value: TValue) => boolean
): [Map<TKey, TValue>, Map<TKey, TValue>];
export function partitionValue<TKey, TValue>(
    map: ReadonlyMap<TKey, TValue>,
    predicate: (value: TValue) => boolean
): [Map<TKey, TValue>, Map<TKey, TValue>] {
    const a = new Map<TKey, TValue>();
    const b = new Map<TKey, TValue>();
    for (const [key, value] of map.entries()) {
        if (predicate(value)) {
            a.set(key, value);
        } else {
            b.set(key, value);
        }
    }
    return [a, b];
}

export function insert<T, U>(map: ReadonlyMap<T, U>, key: T, value: U): Map<T, U> {
    return copy(map).set(key, value);
}

export async function liftPromises<T, U>(promises: ReadonlyMap<T, Promise<U>>): Promise<Map<T, U>> {
    return Promise.all(promises.values())
        .then(values => zip(promises.keys(), values))
        .then(entries => new Map(entries));
}

export function liftResults<TKey, TReason, TValue>(
    map: ReadonlyMap<TKey, Result<TReason, TValue>>
): Result<TReason, Map<TKey, TValue>> {
    const [successes, failures] = partitionValue(map, isSuccess);
    if (empty(failures)) {
        return success(mapValue(successes, success => success.value));
    } else {
        return failure(toArray(concatMap(failures.values(), failure => failure.reasons)));
    }
}
