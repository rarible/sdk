import BigNumber from "bignumber.js"
import type { Address } from "@rarible/types"
import { toAddress } from "@rarible/types"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { createWethContract } from "@rarible/ethereum-sdk-test-common/build/contracts/test-weth"

export async function resetWethFunds(wallet: EthereumWallet, sdk: RaribleSdk, contract: Address) {
	const wethAsset = { assetClass: "ERC20" as const, contract }
	const walletAddress = toAddress(await wallet.ethereum.getFrom())
	const wethContract = createWethContract((wallet.ethereum as any).config.web3, contract)
	//todo uncomment
	// const wethBidderBalance = new BigNumber(await sdk.balances.getBalance(walletAddress, wethAsset))
	const wethBidderBalance = new BigNumber(await wethContract.methods.balanceOf(walletAddress).call())
		.div(new BigNumber(10).pow(18))

	// console.log("wethBidderBalance", wethBidderBalance.toString())
	if (wethBidderBalance.gt("0")) {
		const tx = await sdk.balances.convert(
			wethAsset,
			{ assetClass: "ETH" },
			wethBidderBalance
		)
		await tx.wait()
	}
}
