export function empty<T>(iterable: Iterable<T>): boolean {
    return iterable[Symbol.iterator]().next().done ?? false;
}

export function notEmpty<T>(iterable: Iterable<T>): boolean {
    return !empty(iterable);
}

export function* map<T, U>(
    iterable: Iterable<T>,
    f: (element: T, index: number) => U
): Iterable<U> {
    let i = 0;
    for (const element of iterable) {
        yield f(element, i++);
    }
}

export function mapFn<T, U>(
    f: (element: T, index: number) => U
): (iterable: Iterable<T>) => Iterable<U> {
    return iterable => map(iterable, f);
}

export function filter<T, U extends T>(
    iterable: Iterable<T>,
    predicate: (element: T, index: number) => element is U
): Iterable<U>;
export function filter<T>(
    iterable: Iterable<T>,
    predicate: (element: T, index: number) => boolean
): Iterable<T>;
export function* filter<T>(
    iterable: Iterable<T>,
    predicate: (element: T, index: number) => boolean
): Iterable<T> {
    let i = 0;
    for (const element of iterable) {
        if (predicate(element, i++)) {
            yield element;
        }
    }
}

export function fold<T, U>(
    iterable: Iterable<T>,
    f: (accumulator: U, element: T, index: number) => U,
    initial: U
): U {
    let i = 0;
    let result = initial;
    for (const element of iterable) {
        result = f(result, element, i++);
    }
    return result;
}

export function foldFn<T, U>(
    f: (accumulator: U, element: T, index: number) => U,
    initial: U
): (iterable: Iterable<T>) => U {
    return iterable => fold(iterable, f, initial);
}

export function* concatMap<T, U>(
    iterable: Iterable<T>,
    f: (element: T, index: number) => Iterable<U>
): Iterable<U> {
    let i = 0;
    for (const element of iterable) {
        for (const mapped of f(element, i++)) {
            yield mapped;
        }
    }
}

export function concatMapFn<T, U>(
    f: (element: T, index: number) => Iterable<U>
): (iterable: Iterable<T>) => Iterable<U> {
    return iterable => concatMap(iterable, f);
}

export function partition<T, U extends T>(
    iterable: Iterable<T>,
    predicate: (element: T, index: number) => element is U
): [Iterable<U>, Iterable<Exclude<T, U>>];
export function partition<T>(
    iterable: Iterable<T>,
    predicate: (element: T, index: number) => boolean
): [Iterable<T>, Iterable<T>];
export function partition<T>(
    iterable: Iterable<T>,
    predicate: (element: T, index: number) => boolean
): [Iterable<T>, Iterable<T>] {
    return [
        filter(iterable, predicate),
        filter(iterable, (element: T, index: number) => !predicate(element, index))
    ];
}

export function* zip<T, U>(a: Iterable<T>, b: Iterable<U>): Iterable<[T, U]> {
    const ai = a[Symbol.iterator]();
    const bi = b[Symbol.iterator]();

    let an = ai.next();
    let bn = bi.next();
    while (!an.done && !bn.done) {
        yield [an.value, bn.value];
        an = ai.next();
        bn = bi.next();
    }
}

export function zipFn<T, U>(b: Iterable<U>): (a: Iterable<T>) => Iterable<[T, U]> {
    return a => zip(a, b);
}

export function intoArray<T>(iterable: Iterable<T>): T[] {
    const array = [];
    for (const element of iterable) {
        array.push(element);
    }
    return array;
}
