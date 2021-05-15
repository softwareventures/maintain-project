export type AsyncIterableLike<T> = Iterable<Promise<T>> | AsyncIterable<T>;

export function filter<T, U extends T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T) => element is U
): AsyncIterable<U>;
export function filter<T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T) => Promise<boolean> | boolean
): AsyncIterable<T>;
export async function* filter<T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T) => Promise<boolean> | boolean
): AsyncIterable<T> {
    for await (const element of iterable) {
        if (await predicate(element)) {
            yield element;
        }
    }
}

export function asyncFilter<T, U extends T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T) => element is U
): AsyncIterable<U>;
export function asyncFilter<T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T) => Promise<boolean> | boolean
): AsyncIterable<T>;
export function asyncFilter<T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T) => Promise<boolean> | boolean
): AsyncIterable<T> {
    return filter(iterable, predicate);
}

export function filterFn<T, U extends T>(
    predicate: (element: T) => element is U
): (iterable: AsyncIterableLike<T>) => AsyncIterable<U>;
export function filterFn<T>(
    predicate: (element: T) => Promise<boolean> | boolean
): (iterable: AsyncIterableLike<T>) => AsyncIterable<T>;
export function filterFn<T>(
    predicate: (element: T) => Promise<boolean> | boolean
): (iterable: AsyncIterableLike<T>) => AsyncIterable<T> {
    return iterable => filter(iterable, predicate);
}

export function asyncFilterFn<T, U extends T>(
    predicate: (element: T) => element is U
): (iterable: AsyncIterableLike<T>) => AsyncIterable<U>;
export function asyncFilterFn<T>(
    predicate: (element: T) => Promise<boolean> | boolean
): (iterable: AsyncIterableLike<T>) => AsyncIterable<T>;
export function asyncFilterFn<T>(
    predicate: (element: T) => Promise<boolean> | boolean
): (iterable: AsyncIterableLike<T>) => AsyncIterable<T> {
    return filterFn(predicate);
}

export function exclude<T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T) => Promise<boolean> | boolean
): AsyncIterable<T> {
    return filter(iterable, element => !predicate(element));
}

export const asyncExclude = exclude;

export function excludeFn<T>(
    predicate: (element: T) => Promise<boolean> | boolean
): (iterable: AsyncIterableLike<T>) => AsyncIterable<T> {
    return iterable => exclude(iterable, predicate);
}

export const asyncExcludeFn = excludeFn;

export async function* excludeNull<T>(
    iterable: AsyncIterableLike<T | null | undefined>
): AsyncIterable<T> {
    for await (const element of iterable) {
        if (element != null) {
            yield element;
        }
    }
}

export const asyncExcludeNull = excludeNull;

export async function* map<T, U>(
    iterable: AsyncIterableLike<T>,
    f: (element: T) => Promise<U> | U
): AsyncIterable<U> {
    for await (const element of iterable) {
        yield await f(element);
    }
}

export const asyncMap = map;

export function mapFn<T, U>(
    f: (element: T) => Promise<U> | U
): (iterable: AsyncIterableLike<T>) => AsyncIterable<U> {
    return iterable => map(iterable, f);
}

export const asyncMapFn = mapFn;

export async function* asyncConcatMap<T, U>(
    iterable: AsyncIterableLike<T>,
    f: (element: T) => AsyncIterableLike<U> | Iterable<U>
): AsyncIterable<U> {
    for await (const a of iterable) {
        for await (const b of f(a)) {
            yield b;
        }
    }
}

export function asyncConcatMapFn<T, U>(
    f: (element: T) => AsyncIterableLike<U> | Iterable<U>
): (iterable: AsyncIterableLike<T>) => AsyncIterable<U> {
    return iterable => asyncConcatMap(iterable, f);
}

export async function combineAsync<T>(iterable: AsyncIterableLike<T>): Promise<T[]> {
    const result = [] as T[];
    for await (const element of iterable) {
        result.push(element);
    }
    return result;
}
