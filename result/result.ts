export type Result<TReason = void, TValue = void> = Success<TValue> | Failure<TReason>;

export interface Success<T = void> {
    readonly type: "success";
    readonly value: T;
}

export interface Failure<T = void> {
    readonly type: "failure";
    readonly reasons: readonly T[];
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
