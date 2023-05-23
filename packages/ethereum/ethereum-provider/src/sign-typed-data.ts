import { TypedDataUtils } from "eth-sig-util"
import type { MessageTypes, TypedMessage } from "./domain"
import { SignTypedDataMethodEnum } from "./domain"

export type SendFunction = (method: string, params: any) => Promise<any>

export async function signTypedData<T extends MessageTypes>(
	send: SendFunction, signer: string, data: TypedMessage<T>,
): Promise<string> {
	try {
		const signature = await send(SignTypedDataMethodEnum.V4, [signer, JSON.stringify(data)])
		filterErrors(signature)
		return signature
	} catch (error) {
		filterErrors(error)
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
			throw new SignTypedDataError({
				message: getErrorMessage(error) || "Can't sign typed data by V4/V3/Default methods",
				error: e,
				data: {
					signer,
					data,
				},
			})
		}
	}
}

function getErrorMessage(e: unknown) {
	if (isError(e)) return e.message
	if (hasCode(e) && e.code === 4001) {
		return "Request rejected"
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

export function filterErrors(original: unknown) {
	if (hasCode(original)) {
		if ([4900, 4001, 4901, 4100].includes(original.code)) {
			throw original
		}
		if (hasMessage(original) && original.message?.includes("User denied message signature.")) {
			throw original
		}
	}
}

function hasCode(error: unknown): error is { code: number } {
	return typeof error === "object" && error !== null && "code" in error
}
function hasMessage(error: unknown): error is { message: string } {
	return typeof error === "object" && error !== null && "message" in error
}

function toBuffer(hex: string) {
	if (hex.startsWith("0x")) {
		return Buffer.from(hex.substring(2), "hex")
	} else {
		return Buffer.from(hex, "hex")
	}
}

export class SignTypedDataError extends Error {
  data: any
  error: any
	code?: string | number

	constructor(data: { error: any, data: any, message?: string }) {
  	super(SignTypedDataError.getErrorMessage(data))
  	Object.setPrototypeOf(this, SignTypedDataError.prototype)
  	this.name = "SignTypedDataError"
  	this.error = data?.error
  	this.data = data?.data
		this.code = data?.error?.code || undefined
	}

	static getErrorMessage(data: any) {
		if (typeof data.error === "string") return data.error
		return data.message || data?.error?.message || "SignTypedDataError"
	}
}
