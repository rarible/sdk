import { TypedDataUtils } from "eth-sig-util"
import type { MessageTypes, TypedMessage } from "./domain"
import { SignTypedDataMethodEnum } from "./domain"
import { EthereumProviderError } from "./errors"

export type SendFunction = (method: string, params: any) => Promise<any>

export async function signTypedData<T extends MessageTypes>(
	send: SendFunction, signer: string, data: TypedMessage<T>,
): Promise<string> {
	try {
		return await send(SignTypedDataMethodEnum.V4, [signer, JSON.stringify(data)])
	} catch (error) {
		try {
			console.error("got error while executing sign typed data v4", error)
			if (isError(error) && error.message === "MetaMask Message Signature: Error: Not supported on this device") {
				return await signWithHardwareWallets(send, signer, data)
			} else {
				filterErrors(error)
				try {
					return await send(SignTypedDataMethodEnum.V3, [signer, JSON.stringify(data)])
				} catch (error) {
					console.error("got error while executing sign typed data v3", error)
					filterErrors(error)
					return await send(SignTypedDataMethodEnum.DEFAULT, [signer, data])
				}
			}
		} catch (e) {
			throw new EthereumProviderError({
				error: e,
				data: {
					signer,
					data,
					v4SignError: error,
				},
				method: "EthereumProvider.signTypedData",
				signer,
			})
		}
	}
}

function isError(x: unknown): x is Error {
	return typeof x === "object" && x !== null && "message" in x
}

async function signWithHardwareWallets<T extends MessageTypes>(
	send: SendFunction, signer: string, data: TypedMessage<T>,
) {
	const hash = TypedDataUtils.sign(data)
	const signature = toBuffer(await send("eth_sign", [signer, `0x${hash.toString("hex")}`]))
	signature.writeInt8(signature[64] + 4, 64)
	return `0x${signature.toString("hex")}`
}

/*
	4900 - wallet is disconnected
	4001 - user cancelled request
	4901 - chain is not connected
	4100 - not authorized in wallet
*/

function filterErrors(original: unknown) {
	if (hasCode(original)) {
		if ([4900, 4001, 4901, 4100].includes(original.code)) {
			throw original
		}
	}
}

function hasCode(error: unknown): error is { code: number } {
	return typeof error === "object" && error !== null && "code" in error
}

function toBuffer(hex: string) {
	if (hex.startsWith("0x")) {
		return Buffer.from(hex.substring(2), "hex")
	} else {
		return Buffer.from(hex, "hex")
	}
}
