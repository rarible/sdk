import { Blockchain } from "@rarible/api-client"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import { RemoteLogger } from "@rarible/logger/build"
import type { LoggableValue } from "@rarible/logger/build/domain"
import axios from "axios"
import type { Middleware } from "../middleware/middleware"
import type { ISdkContext } from "../../domain"

type LogsLevel = "trace" | "error" | "disabled"

const loggerConfig = {
	ELK_URL: "https://logging.rarible.com/",
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
			service: "union-sdk",
			environment: sdkContext.env,
			...(sdkContext.wallet ? await getWalletInfo(sdkContext.wallet) : { }),
		}
	}

	const remoteLogger = new RemoteLogger((msg: LoggableValue) => axios.post(loggerConfig.ELK_URL, msg), {
		initialContext: getContext(),
	})

	return (callable, args) => {
		if (logsLevel === "trace") {
			remoteLogger.trace(callable.name, { args })
		}

		return Promise.resolve([callable, async (res) => {
			if (logsLevel === "error" || logsLevel === "trace") {
				res.catch((err) => {
					remoteLogger.error(callable.name,  { error: err.toString() }, { args })
				})
			}
			return res
		}])
	}
}
