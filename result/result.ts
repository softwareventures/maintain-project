import {map} from "@softwareventures/array";
import {concatMap, filter, fold, toArray} from "@softwareventures/iterable";
import {
    asyncFilter,
    asyncFold,
    AsyncIterableLike,
    combineAsync
} from "../collections/async-iterable";

export type Result<TReason = void, TValue = void> = Success<TValue> | Failure<TReason>;

export interface Success<T = void> {
    readonly type: "success";
    readonly value: T;
}

export interface Failure<T = void> {
    readonly type: "failure";
    readonly reasons: readonly T[];
}

export function success(): Success;
export function success<T>(value: T): Success<T>;
export function success<T>(value?: T): Success<T | undefined> {
    return {type: "success", value};
}

export function failure(): Failure;
export function failure<T>(reasons: readonly T[]): Failure<T>;
export function failure<T>(reasons: readonly T[] = []): Failure<T> {
    return {type: "failure", reasons};
}

export function isSuccess<TReason, TValue>(
    result: Result<TReason, TValue>
): result is Success<TValue> {
    return result.type === "success";
}

export function isFailure<TReason, TValue>(
    result: Result<TReason, TValue>
): result is Failure<TReason> {
    return result.type === "failure";
}

export function mapResult<TReason, TValue, TNewValue>(
    result: Result<TReason, TValue>,
    f: (value: TValue) => TNewValue
): Result<TReason, TNewValue> {
    if (result.type === "success") {
        return {type: "success", value: f(result.value)};
    } else {
        return result;
    }
}

export function mapResultFn<TReason, TValue, TNewValue>(
    f: (value: TValue) => TNewValue
): (result: Result<TReason, TValue>) => Result<TReason, TNewValue> {
    return result => mapResult(result, f);
}

export async function mapAsyncResult<TReason, TValue, TNewValue>(
    result: Result<TReason, TValue>,
    f: (value: TValue) => PromiseLike<TNewValue> | TNewValue
): Promise<Result<TReason, TNewValue>> {
    if (result.type === "success") {
        return Promise.resolve(f(result.value)).then(value => ({type: "success", value}));
    } else {
        return result;
    }
}

export function mapAsyncResultFn<TReason, TValue, TNewValue>(
    f: (value: TValue) => PromiseLike<TNewValue> | TNewValue
): (result: Result<TReason, TValue>) => Promise<Result<TReason, TNewValue>> {
    return async result => mapAsyncResult(result, f);
}

export function bindResult<TReason, TNewReason = TReason, TValue = void, TNewValue = void>(
    result: Result<TReason, TValue>,
    f: (value: TValue) => Result<TNewReason | TReason, TNewValue>
): Result<TNewReason | TReason, TNewValue> {
    if (result.type === "success") {
        return f(result.value);
    } else {
        return result;
    }
}

export function bindResultFn<TReason, TNewReason = TReason, TValue = void, TNewValue = void>(
    f: (value: TValue) => Result<TNewReason | TReason, TNewValue>
): (result: Result<TReason, TValue>) => Result<TNewReason | TReason, TNewValue> {
    return result => bindResult(result, f);
}

export async function bindAsyncResult<
    TReason,
    TNewReason = TReason,
    TValue = void,
    TNewValue = void
>(
    result: Result<TReason, TValue>,
    f: (value: TValue) => PromiseLike<Result<TNewReason | TReason, TNewValue>>
): Promise<Result<TNewReason | TReason, TNewValue>> {
    if (result.type === "success") {
        return Promise.resolve(f(result.value));
    } else {
        return result;
    }
}

export function bindAsyncResultFn<TReason, TNewReason = TReason, TValue = void, TNewValue = void>(
    f: (value: TValue) => PromiseLike<Result<TNewReason | TReason, TNewValue>>
): (result: Result<TReason, TValue>) => Promise<Result<TNewReason | TReason, TNewValue>> {
    return async result => bindAsyncResult(result, f);
}

export function mapFailure<TReason, TValue>(
    result: Result<TReason, TValue>,
    f: (reason: TReason) => never
): Success<TValue>;
export function mapFailure<TReason, TValue, TNewReason>(
    result: Result<TReason, TValue>,
    f: (reason: TReason) => TNewReason
): Result<TNewReason, TValue>;
export function mapFailure<TReason, TValue, TNewReason>(
    result: Result<TReason, TValue>,
    f: (reason: TReason) => TNewReason
): Result<TNewReason, TValue> {
    if (result.type === "success") {
        return result;
    } else {
        return {type: "failure", reasons: map(result.reasons, f)};
    }
}

export function mapFailureFn<TReason, TValue>(
    f: (reason: TReason) => never
): (result: Result<TReason, TValue>) => Success<TValue>;
export function mapFailureFn<TReason, TValue, TNewReason>(
    f: (reason: TReason) => TNewReason
): (result: Result<TReason, TValue>) => Result<TNewReason, TValue>;
export function mapFailureFn<TReason, TValue, TNewReason>(
    f: (reason: TReason) => TNewReason
): (result: Result<TReason, TValue>) => Result<TNewReason, TValue> {
    return reason => mapFailure(reason, f);
}

export function bindFailure<TReason, TNewReason, TValue, TNewValue = TValue>(
    result: Result<TReason, TValue>,
    f: (reasons: readonly TReason[]) => Result<TNewReason, TNewValue>
): Result<TNewReason, TValue | TNewValue> {
    if (result.type === "success") {
        return result;
    } else {
        return f(result.reasons);
    }
}

export function bindFailureFn<TReason, TNewReason, TValue, TNewValue = TValue>(
    f: (reasons: readonly TReason[]) => Result<TNewReason, TNewValue>
): (result: Result<TReason, TValue>) => Result<TNewReason, TValue | TNewValue> {
    return result => bindFailure(result, f);
}

export async function bindFailureAsync<TReason, TNewReason, TValue, TNewValue = TValue>(
    result: Result<TReason, TValue>,
    f: (reasons: readonly TReason[]) => Promise<Result<TNewReason, TNewValue>>
): Promise<Result<TNewReason, TValue | TNewValue>> {
    if (result.type === "success") {
        return result;
    } else {
        return f(result.reasons);
    }
}

export function bindFailureAsyncFn<TReason, TNewReason, TValue, TNewValue = TValue>(
    f: (reasons: readonly TReason[]) => Promise<Result<TNewReason, TNewValue>>
): (result: Result<TReason, TValue>) => Promise<Result<TNewReason, TValue | TNewValue>> {
    return async result => bindFailureAsync(result, f);
}

export function combineResults<TReason>(results: Iterable<Result<TReason>>): Result<TReason> {
    return failure(toArray(concatMap(filter(results, isFailure), ({reasons}) => reasons)));
}

export async function combineAsyncResults<TReason>(
    results: AsyncIterableLike<Result<TReason>>
): Promise<Result<TReason>> {
    return combineAsync(asyncFilter(results, isFailure)).then(failures =>
        failures.length === 0
            ? success()
            : failure(toArray(concatMap(failures, failure => failure.reasons)))
    );
}

export function chainResults<TReason, TValue>(
    initial: TValue,
    actions: Iterable<(value: TValue) => Result<TReason, TValue>>
): Result<TReason, TValue> {
    return fold(actions, bindResult, {type: "success", value: initial} as Result<TReason, TValue>);
}

export function chainResultsFn<TReason, TValue>(
    actions: Iterable<(value: TValue) => Result<TReason, TValue>>
): (initial: TValue) => Result<TReason, TValue> {
    return initial => chainResults(initial, actions);
}

export async function chainAsyncResults<TReason, TValue>(
    initial: TValue,
    actions: Iterable<(value: TValue) => PromiseLike<Result<TReason, TValue>>>
): Promise<Result<TReason, TValue>> {
    return fold(
        actions,
        async (accumulator, action) => accumulator.then(bindAsyncResultFn(action)),
        Promise.resolve<Result<TReason, TValue>>({type: "success", value: initial})
    );
}

export function chainAsyncResultsFn<TReason, TValue>(
    actions: Iterable<(value: TValue) => PromiseLike<Result<TReason, TValue>>>
): (initial: TValue) => Promise<Result<TReason, TValue>> {
    return async initial => chainAsyncResults(initial, actions);
}

export async function tolerantFoldAsyncResults<TElement, TReason, TAccumulator>(
    iterable: AsyncIterableLike<TElement>,
    f: (
        accumulator: TAccumulator,
        element: TElement
    ) => Promise<Result<TReason, TAccumulator>> | Result<TReason, TAccumulator>,
    initial: TAccumulator
): Promise<Result<TReason, TAccumulator>> {
    return asyncFold(
        iterable,
        async ({accumulator, reasons}, element) =>
            Promise.resolve(f(accumulator, element))
                .then(mapResultFn(accumulator => ({accumulator, reasons})))
                .then(
                    bindFailureFn(reasons2 =>
                        success({accumulator, reasons: [...reasons, ...reasons2]})
                    )
                )
                .then(throwFailure),
        {accumulator: initial, reasons: [] as TReason[]}
    ).then(({accumulator, reasons}) =>
        reasons.length === 0 ? success(accumulator) : failure(reasons)
    );
}

export function tolerantFoldAsyncResultsFn<TElement, TReason, TAccumulator>(
    f: (
        accumulator: TAccumulator,
        element: TElement
    ) => Promise<Result<TReason, TAccumulator>> | Result<TReason, TAccumulator>,
    initial: TAccumulator
): (iterable: AsyncIterableLike<TElement>) => Promise<Result<TReason, TAccumulator>> {
    return async iterable => tolerantFoldAsyncResults(iterable, f, initial);
}

type InferReasons<T> = T extends ReadonlyArray<Result<infer Reasons, unknown>> ? Reasons : never;
type InferValue<T> = T extends Success<infer Value> ? Value : never;

export function allResults<T extends Array<Result<unknown, unknown>>>(
    results: readonly [...T]
): Result<InferReasons<T>, {[K in keyof T]: InferValue<T[K]>}> {
    return fold(
        results,
        (acc, result) =>
            bindResult(acc, accValues => mapResult(result, value => [...accValues, value])),
        success([]) as Result<any, any[]>
    ) as any;
}

type InferAwaited<T> = T extends Promise<infer Value> ? Value : T;
type InferAwaiteds<T extends unknown[]> = {[K in keyof T]: InferAwaited<T[K]>};

export async function allAsyncResults<
    T extends Array<Promise<Result<unknown, unknown>> | Result<unknown, unknown>>
>(
    results: readonly [...T]
): Promise<
    Result<InferReasons<InferAwaiteds<T>>, {[K in keyof T]: InferValue<InferAwaited<T[K]>>}>
> {
    return Promise.all(results).then(results => allResults(results) as any);
}

export function toNullable<TValue>(result: Result<unknown, TValue>): TValue | null {
    return result.type === "success" ? result.value : null;
}

export async function toAsyncNullable<TValue>(
    result: Promise<Result<unknown, TValue>>
): Promise<TValue | null> {
    return result.then(toNullable);
}

export function throwFailure<TValue>(result: Result<unknown, TValue>, message?: string): TValue {
    if (result.type === "success") {
        return result.value;
    } else {
        throw new Error(
            (message == null ? "" : `${message}:\n`) +
                map(result.reasons, reason => JSON.stringify(reason)).join("\n")
        );
    }
}

export function throwFailureFn<TValue>(
    message: string
): (result: Result<unknown, TValue>) => TValue {
    return result => throwFailure(result, message);
}
