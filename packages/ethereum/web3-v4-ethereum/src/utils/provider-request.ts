import type { JsonRpcPayload, JsonRpcResponse } from "web3-core-helpers"

export async function providerRequest(provider: any, method: string, params: unknown[]): Promise<any> {
	if (typeof provider !== "object" || provider === null) {
		throw new Error("Provider is not an object")
	}
	if (typeof provider.request !== "function") {
		return requestLegacy(provider, method, params)
	}
	return provider.request({ method, params })
}

function legacySend(
	provider: any,
	payload: JsonRpcPayload,
	callback: (error: Error | null, result?: JsonRpcResponse | undefined) => void
) {
	if (provider !== null && typeof provider === "object") {
		if (typeof provider.sendAsync === "function") {
			provider.sendAsync(payload, callback)
		} else if (typeof provider.send === "function") {
			provider.send(payload, callback)
		} else {
			throw new Error("No send method defined")
		}
	} else {
		throw new Error("No send method defined")
	}
}

function requestLegacy(provider: any, method: string, params: unknown[]): Promise<any> {
	return new Promise<any>(async (resolve, reject) => {
		try {
			await legacySend(provider, {
				jsonrpc: "2.0",
				id: new Date().getTime(),
				method,
				params,
			}, (error, result) => {
				const err = error || result?.error
				if (err) {
					reject(err)
				}
				if (result?.result) {
					resolve(result.result)
				}
				reject(new Error("Can't handle JSON-RPC request"))
			})
		} catch (error) {
			reject(error)
		}
	})
}
