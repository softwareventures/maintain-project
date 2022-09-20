import {findIndex} from "@softwareventures/array";

export function findExtract<T, U extends T>(
    array: ArrayLike<T>,
    predicate: (element: T) => element is U
): [U | null, T[]];
export function findExtract<T>(
    array: ArrayLike<T>,
    predicate: (element: T) => boolean
): [T | null, T[]];
export function findExtract<T>(
    array: ArrayLike<T>,
    predicate: (element: T) => boolean
): [T | null, T[]] {
    const index = findIndex(array, predicate);
    return index == null
        ? [null, Array.from(array)]
        : [array[index] as T, excludeIndex(array, index)];
}

export function findExtractFn<T, U extends T>(
    predicate: (element: T) => element is U
): (array: ArrayLike<T>) => [U | null, T[]];
export function findExtractFn<T>(
    predicate: (element: T) => boolean
): (array: ArrayLike<T>) => [T | null, T[]];
export function findExtractFn<T>(
    predicate: (element: T) => boolean
): (array: ArrayLike<T>) => [T | null, T[]] {
    return array => findExtract(array, predicate);
}

export function excludeIndex<T>(array: ArrayLike<T>, index: number): T[] {
    const a = Array.from(array);
    return [...a.slice(0, index), ...a.slice(index + 1)];
}

export function splitWhere<T>(array: ArrayLike<T>, predicate: (element: T) => boolean): T[][] {
    let current: T[] = [];
    const result = [current];

    for (let i = 0; i < array.length; ++i) {
        const element = array[i] as T;
        if (predicate(element)) {
            current = [];
            result.push(current);
        } else {
            current.push(element);
        }
    }

    return result;
}

export function splitWhereFn<T>(
    predicate: (element: T) => boolean
): (array: ArrayLike<T>) => T[][] {
    return array => splitWhere(array, predicate);
}
