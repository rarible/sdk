import { RemoteLogger } from "@rarible/logger/build"
import type { LoggableValue } from "@rarible/logger/build/domain"
import { BlockchainGroup } from "@rarible/api-client"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import axios from "axios"
import type { Middleware } from "../middleware/middleware"
import type { ISdkContext } from "../../domain"
import { LogsLevel } from "../../domain"

const loggerConfig = {
	service: "union-sdk",
	elkUrl: "https://logging.rarible.com/",
}

async function getWalletInfo(wallet: BlockchainWallet): Promise<Record<string, string>> {
	const info: Record<string, any> = {
		"wallet.blockchain": wallet.blockchain,
	}

	switch (wallet.blockchain) {
		case BlockchainGroup.ETHEREUM:
			await Promise.all([wallet.ethereum.getChainId(), wallet.ethereum.getFrom()])
				.then(([chainId, address]) => {
					info["wallet.address"] = address
					info["wallet.chainId"] = chainId
				})
				.catch((err) => {
					info["wallet.address"] = `unknown (${err && err.toString()})`
				})
			break
		case BlockchainGroup.FLOW:
			await wallet.fcl.currentUser().snapshot()
				.then((userData) => {
					info["wallet.address"] = userData.addr
					info["wallet.flow.chainId"] = userData.cid
				})
				.catch((err) => {
					info["wallet.address"] = `unknown (${err && err.toString()})`
				})
			break
		case BlockchainGroup.TEZOS:
			info["wallet.tezos.kind"] = wallet.provider.kind
			await Promise.all([wallet.provider.chain_id(), wallet.provider.address()])
				.then(([chainId, address]) => {
					info["wallet.address"] = address
					info["wallet.tezos.chainId"] = chainId
				})
				.catch((err) => {
					info["wallet.address"] = `unknown (${err && err.toString()})`
				})
			break
		case BlockchainGroup.SOLANA:
			info["wallet.address"] = wallet.provider.publicKey?.toString()
			break
		default:
			info["wallet.address"] = "unknown"
	}

	return info
}

export function getErrorMessageString(err: any): string {
	if (!err) {
		return "not defined"
	} else if (typeof err === "string") {
		return err
	} else if (err instanceof Error) {
		return err.message
	} else if (err.message) {
		return typeof err.message === "string" ? err.message : JSON.stringify(err.message)
	} else if (err.status !== undefined && err.statusText !== undefined) {
		return JSON.stringify({
			url: err.url,
			status: err.status,
			statusText: err.statusText,
		})
	} else {
		return JSON.stringify(err)
	}
}

export function getInternalLoggerMiddleware(logsLevel: LogsLevel, sdkContext: ISdkContext): Middleware {
	const getContext = async () => {
		return {
			service: loggerConfig.service,
			environment: sdkContext.env,
			...(sdkContext.wallet ? await getWalletInfo(sdkContext.wallet) : { }),
		}
	}

	const remoteLogger = new RemoteLogger((msg: LoggableValue) => axios.post(loggerConfig.elkUrl, msg), {
		initialContext: getContext(),
		dropBatchInterval: 1000,
		maxByteSize: 3 * 10240,
	})

	return async (callable, args) => {
		const time = Date.now()

		return [callable, async (responsePromise) => {
			try {
				const res = await responsePromise

				if (logsLevel >= LogsLevel.TRACE) {
					remoteLogger.raw({
						level: "TRACE",
						method: callable.name,
						message: "trace of " + callable.name,
						duration: (Date.now() - time) / 1000,
						args: JSON.stringify(args),
						resp: JSON.stringify(res),
					})
				}
			} catch (err: any) {
				if (logsLevel >= LogsLevel.ERROR) {
					remoteLogger.raw({
						level: "ERROR",
						method: callable.name,
						message: getErrorMessageString(err),
						duration: (Date.now() - time) / 1000,
						args: JSON.stringify(args),
					})
				}
			}

			return responsePromise
		}]
	}
}
