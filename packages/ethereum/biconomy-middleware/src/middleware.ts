import { ethers } from "ethers"
import { Biconomy } from "@biconomy/mexa"
import type { JsonRpcMiddleware } from "json-rpc-engine"
import { createAsyncMiddleware } from "json-rpc-engine"
import type { Block } from "eth-json-rpc-middleware/dist/utils/cache"
import type { IBiconomyConfig, IContractRegistry, ILimitsRegistry } from "./types"
import { MetaContractAbi } from "./abi/methods-abi"
import { providerRequest } from "./utils/provider-request"
import { signTypedData } from "./sign-typed-data"
import { BiconomyMiddlewareError } from "./errors"

export function biconomyMiddleware(
	provider: any,
	registry: IContractRegistry,
	limitsRegistry: ILimitsRegistry,
	biconomyConfig: IBiconomyConfig
): JsonRpcMiddleware<string[], Block> {
	const biconomy = new Biconomy(getBiconomySupportedProvider(provider), biconomyConfig)
	const ethersProvider = new ethers.providers.Web3Provider(provider)
	const signer = ethersProvider.getSigner()
	const biconomyState = new Promise(((resolve, reject) => {
		biconomy.onEvent(biconomy.READY, resolve)
		biconomy.onEvent(biconomy.ERROR, (error: any, message: any) => reject(new Error(error.message + (message ? "\n" + message : ""))))
	}))

	return createAsyncMiddleware(async (req, res, next) => {
		if (req.method === "eth_sendTransaction" && req.params) {
			const [tx] = req.params as unknown[]
			if (isTransactionParams(tx) && hasNullValue(tx)) {
				try {
					const metadata = await registry.getMetadata(tx.to, tx.data)
					if (metadata) {
						await biconomyState
						const limits = await limitsRegistry.checkLimits(tx.from)
						if (!limits.allowed) {
							return next()
						}
						const contract = new ethers.Contract(tx.to, MetaContractAbi, signer)
						const interfaceHelper = new ethers.utils.Interface(MetaContractAbi)

						const dataToSign = {
							...metadata,
							message: {
								nonce: parseInt(await contract.getNonce(tx.from)),
								from: tx.from,
								functionSignature: tx.data,
							},
						}
						const send = ((method: string, params?: any) => providerRequest(provider, method, params))
						const signature = await signTypedData(send, tx.from, dataToSign as any)
						const { r, s, v } = getSignatureParameters(signature)

						tx.data = interfaceHelper.encodeFunctionData("executeMetaTransaction", [tx.from, tx.data, r, s, v])
						res.result = await providerRequest(biconomy, "eth_sendTransaction", [tx])

						return
					}
				} catch (err: any) {
					res.error = new BiconomyMiddlewareError({
						message: err?.message,
						error: err,
						data: {
							signer,
							req,
						},
					})
				}
			}
		}
		await next()
	})
}

function getBiconomySupportedProvider(provider: any) {
	try {
		if (provider.send) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			provider.send()
		} else {
			provider.send = provider.sendAsync
		}
	} catch (e: any) {
		if (e.toString().includes("does not support synchronous requests")) {
			provider.send = provider.sendAsync
		}
	}

	return provider
}

function getSignatureParameters(signature: string) {

	if (!ethers.utils.isHexString(signature)) {
		throw new Error(
			'Given value "'.concat(signature, '" is not a valid hex string.')
		)
	}
	const r = signature.slice(0, 66)
	const s = "0x".concat(signature.slice(66, 130))
	let v: any = "0x".concat(signature.slice(130, 132))
	v = parseInt(v, 16)
	if (![27, 28].includes(v)) v += 27
	return {
		r: r,
		s: s,
		v: v,
	}
}

type TransactionParams = {
	from: string
	to: string
	data: string
	value: string | undefined
}

function isTransactionParams(x: unknown): x is TransactionParams {
	return typeof x === "object" &&
		x !== null &&
		"from" in x &&
		"to" in x &&
		"data" in x
}

function hasNullValue(tx: TransactionParams) {
	return !tx.value || ethers.BigNumber.from(tx.value).eq(0)
}
