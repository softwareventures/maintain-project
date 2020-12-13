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