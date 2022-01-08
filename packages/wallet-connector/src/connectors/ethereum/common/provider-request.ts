import type { JsonRpcPayload, JsonRpcResponse } from "web3-core-helpers"

export async function providerRequest(provider: any, method: string, params: unknown[] = []): Promise<any> {
	if ("request" in provider && typeof provider.request === "function") {
		return provider.request({ method, params })
	} else {
		return requestLegacy(provider, method, params)
	}
}

function requestLegacy(provider: any, method: string, params: unknown[]): Promise<any> {
	return new Promise<any>((resolve, reject) => {
		try {
			legacySend(provider, {
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

function legacySend(
	provider: any,
	payload: JsonRpcPayload,
	callback: (error: Error | null, result?: JsonRpcResponse | undefined) => void
) {
	if (provider !== null && typeof provider === "object") {
		if ("sendAsync" in provider && typeof provider.sendAsync === "function") {
			provider.sendAsync(payload, callback)
		} else if ("send" in provider && typeof provider.send === "function") {
			provider.send(payload, callback)
		} else {
			throw new Error("No send method defined")
		}
	} else {
		throw new Error("No send method defined")
	}
}