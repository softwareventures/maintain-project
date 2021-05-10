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

export function intoArray<T>(iterable: Iterable<T>): T[] {
    const array = [];
    for (const element of iterable) {
        array.push(element);
    }
    return array;
}
