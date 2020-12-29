import {map} from "@softwareventures/array";
import {fold} from "../collections/iterators";

export type Result<TReason = void, TValue = void> = Success<TValue> | Failure<TReason>;

export interface Success<T = void> {
    readonly type: "success";
    readonly value: T;
}

export interface Failure<T = void> {
    readonly type: "failure";
    readonly reasons: readonly T[];
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
    f: (value: TValue) => PromiseLike<TNewValue>
): Promise<Result<TReason, TNewValue>> {
    if (result.type === "success") {
        return Promise.resolve(f(result.value)).then(value => ({type: "success", value}));
    } else {
        return result;
    }
}

export function mapAsyncResultFn<TReason, TValue, TNewValue>(
    f: (value: TValue) => PromiseLike<TNewValue>
): (result: Result<TReason, TValue>) => Promise<Result<TReason, TNewValue>> {
    return async result => mapAsyncResult(result, f);
}

export function bindResult<TReason, TValue, TNewReason, TNewValue>(
    result: Result<TReason, TValue>,
    f: (value: TValue) => Result<TNewReason | TReason, TNewValue>
): Result<TNewReason | TReason, TNewValue> {
    if (result.type === "success") {
        return f(result.value);
    } else {
        return result;
    }
}

export function bindResultFn<TReason, TValue, TNewReason, TNewValue>(
    f: (value: TValue) => Result<TNewReason | TReason, TNewValue>
): (result: Result<TReason, TValue>) => Result<TNewReason | TReason, TNewValue> {
    return result => bindResult(result, f);
}

export async function bindAsyncResult<TReason, TValue, TNewReason, TNewValue>(
    result: Result<TReason, TValue>,
    f: (value: TValue) => PromiseLike<Result<TNewReason | TReason, TNewValue>>
): Promise<Result<TNewReason | TReason, TNewValue>> {
    if (result.type === "success") {
        return Promise.resolve(f(result.value));
    } else {
        return result;
    }
}

export function bindAsyncResultFn<TReason, TValue, TNewReason, TNewValue>(
    f: (value: TValue) => PromiseLike<Result<TNewReason | TReason, TNewValue>>
): (result: Result<TReason, TValue>) => Promise<Result<TNewReason | TReason, TNewValue>> {
    return async result => bindAsyncResult(result, f);
}

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

export function mapFailureFn<TReason, TValue, TNewReason>(
    f: (reason: TReason) => TNewReason
): (result: Result<TReason, TValue>) => Result<TNewReason, TValue> {
    return reason => mapFailure(reason, f);
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
