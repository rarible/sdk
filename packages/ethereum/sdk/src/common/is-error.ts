import { NetworkError } from "@rarible/logger/build"

export function isError(x: unknown): x is Error {
	return typeof x === "object" && x !== null && "message" in x
}

export function isNetworkError(error: unknown): error is NetworkError {
	return typeof error === "object" && error !== null &&
    (error instanceof NetworkError || error.constructor.name === "NetworkError")
}
