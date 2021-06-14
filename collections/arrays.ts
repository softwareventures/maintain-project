import {coerce, copy, findIndex} from "@softwareventures/array";
import {Comparator, compare, reverse} from "@softwareventures/ordered";
import {all, zip} from "@softwareventures/iterable";

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
    return index == null ? [null, Array.from(array)] : [array[index], excludeIndex(array, index)];
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

export function sortFn<T>(comparator: Comparator<T>): (array: ArrayLike<T>) => T[] {
    return array => copy(array).sort(comparator);
}

export function sortByFn<T, U extends string | number | boolean>(
    f: (element: T) => U
): (array: readonly T[]) => T[] {
    return array => copy(array).sort((a, b) => compare(f(a) as any, f(b) as any));
}

export function sortByDescendingFn<T, U extends string | number | boolean>(
    f: (element: T) => U
): (array: readonly T[]) => T[] {
    return array => copy(array).sort((a, b) => reverse(compare)(f(a) as any, f(b) as any));
}

export function arraysEqual<T>(a: ArrayLike<T>, b: ArrayLike<T>, equal = defaultEqual): boolean {
    return all(zip(coerce(a), coerce(b)), equal);
}

function defaultEqual(a: unknown, b: unknown): boolean {
    return a === b;
}

export function only<T>(a: ArrayLike<T>): T | null {
    return a.length === 1 ? a[0] : null;
}
