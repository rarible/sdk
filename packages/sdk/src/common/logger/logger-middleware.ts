import { RemoteLogger } from "@rarible/logger/build"
import type { LoggableValue } from "@rarible/logger/build/domain"
import { Blockchain } from "@rarible/api-client"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import axios from "axios"
import type { Middleware } from "../middleware/middleware"
import type { ISdkContext } from "../../domain"

export enum LogsLevel {
	DISABLED = 0,
	ERROR = 1,
	TRACE = 2,
}

const loggerConfig = {
	service: "union-sdk",
	elkUrl: "https://logging.rarible.com/",
}

async function getWalletInfo(wallet: BlockchainWallet): Promise<Record<string, string>> {
	const info: Record<string, any> = {
		"wallet.blockchain": wallet.blockchain,
	}

	switch (wallet.blockchain) {
		case Blockchain.ETHEREUM:
			await Promise.all([wallet.ethereum.getChainId(), wallet.ethereum.getFrom()])
				.then(([chainId, address]) => {
					info["wallet.address"] = address
					info["wallet.chainId"] = chainId
				})
				.catch((err) => {
					info["wallet.address"] = `unknown (${err && err.toString()})`
				})
			break
		case Blockchain.FLOW:
			await wallet.fcl.currentUser().snapshot()
				.then((userData) => {
					info["wallet.address"] = userData.addr
					info["wallet.chainId"] = userData.cid
				})
				.catch((err) => {
					info["wallet.address"] = `unknown (${err && err.toString()})`
				})
			break
		case Blockchain.TEZOS:
			info["wallet.tezos.kind"] = wallet.provider.kind
			await Promise.all([wallet.provider.chain_id(), wallet.provider.address()])
				.then(([chainId, address]) => {
					info["wallet.address"] = address
					info["wallet.chainId"] = chainId
				})
				.catch((err) => {
					info["wallet.address"] = `unknown (${err && err.toString()})`
				})
			break
		default:
			info["wallet.address"] = "unknown"
	}

	return info
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
	})

	return async (callable, args) => {
		const time = Date.now()

		return [callable, async (responsePromise) => {
			try {
				const res = await responsePromise
				remoteLogger.trace(callable.name, {
					time: (Date.now() - time) / 1000,
					args,
					response: res,
				})
			} catch (err: any) {
				if (logsLevel >= LogsLevel.ERROR) {
					remoteLogger.error(callable.name, {
						time: (Date.now() - time) / 1000,
						error: err.toString(),
						args,
					})
				}
			}

			return responsePromise
		}]
	}
}
