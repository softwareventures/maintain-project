import {copy} from "@softwareventures/array";
import {compare, reverse} from "@softwareventures/ordered";

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
