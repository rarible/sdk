import BigNumber from "bignumber.js"
import type { Address } from "@rarible/types"
import { toAddress } from "@rarible/types"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"

export async function resetWethFunds(wallet: EthereumWallet, sdk: RaribleSdk, contract: Address) {
	const wethAsset = { assetClass: "ERC20" as const, contract }
	const walletAddress = toAddress(await wallet.ethereum.getFrom())
	const wethBidderBalance = new BigNumber(await sdk.balances.getBalance(walletAddress, wethAsset))

	if (wethBidderBalance.gt("0")) {
		const tx = await sdk.balances.convert(
			wethAsset,
			{ assetClass: "ETH" },
			wethBidderBalance
		)
		await tx.wait()
	}
}
