import type { BlockchainWallet } from "@rarible/sdk-wallet"
import { WalletType } from "@rarible/sdk-wallet"
import { getStringifiedData } from "@rarible/sdk-common"
import { getErrorMessageString } from "./logger/common"

export async function getWalletInfo(wallet: BlockchainWallet): Promise<Record<string, string>> {
	const info: Record<string, any> = {
		"wallet.blockchain": wallet.walletType,
	}

	switch (wallet.walletType) {
		case WalletType.ETHEREUM:
			await Promise.all([wallet.ethereum.getChainId(), wallet.ethereum.getFrom()])
				.then(([chainId, address]) => {
					info["wallet.address"] = address && address.toLowerCase()
					info["wallet.chainId"] = chainId
				})
				.catch((err) => {
					info["wallet.address"] = `unknown (${getErrorMessageString(err)})`
					info["wallet.address.error"] = getStringifiedData(err)
				})
			break
		case WalletType.FLOW:
			await wallet.fcl.currentUser().snapshot()
				.then((userData) => {
					info["wallet.address"] = userData.addr
					info["wallet.flow.chainId"] = userData.cid
				})
				.catch((err) => {
					info["wallet.address"] = `unknown (${getErrorMessageString(err)})`
					info["wallet.address.error"] = getStringifiedData(err)
				})
			break
		case WalletType.TEZOS:
			info["wallet.tezos.kind"] = wallet.provider.kind
			await Promise.all([wallet.provider.chain_id(), wallet.provider.address()])
				.then(([chainId, address]) => {
					info["wallet.address"] = address
					info["wallet.tezos.chainId"] = chainId
				})
				.catch((err) => {
					info["wallet.address"] = `unknown (${getErrorMessageString(err)})`
					info["wallet.address.error"] = getStringifiedData(err)
				})
			break
		case WalletType.SOLANA:
			info["wallet.address"] = wallet.provider.publicKey?.toString()
			break
		case WalletType.IMMUTABLEX:
			const data = wallet.wallet.getConnectionData()
			info["wallet.address"] = data.address
			info["wallet.network"] = data.ethNetwork
			info["wallet.starkPubkey"] = data.starkPublicKey
			break
		default:
			info["wallet.address"] = "unknown"
	}

	return info
}
