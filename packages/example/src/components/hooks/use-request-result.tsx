import { useState } from "react"
import { isString } from "lodash"
import type { FormState } from "../common/form/types"

export interface IRequestResult<T> {
	result: {
		type: "empty"
	} | {
		type: "complete"
		data: T
	} | {
		type: "error"
		error: string
	}
	setComplete: (data: T) => void
	setError: (error: any) => void
	startFetching: () => void
	stopFetching: () => void
	isFetching: boolean
}

export function useRequestResult<T>(): IRequestResult<T> {
	const [isFetching, setFetching] = useState(false)
	const [result, setResult] = useState<IRequestResult<T>["result"]>({ type: "empty" })

	return {
		result,
		isFetching,
		startFetching: () => {
			setFetching(true)
		},
		stopFetching: () => {
			setFetching(false)
		},
		setComplete: (data: T) => {
			setFetching(false)
			setResult({
				type: "complete",
				data,
			})
		},
		setError: (error: any) => {
			console.error(error)
			setFetching(false)

			let errorText
			if (!error) {
				errorText = "Unknown error"
			} else if (isString(error)) {
				errorText = error
			} else if (error.message) {
				errorText = error.message
			} else {
				errorText = JSON.stringify(error)
			}
			setResult({
				type: "error",
				error: errorText,
			})
		},
	}
}

export function resultToState(resultType: IRequestResult<any>["result"]["type"]): FormState {
	switch (resultType) {
		case "complete":
			return "success"
		case "error":
			return "error"
		case "empty":
		default:
			return "normal"
	}
}
