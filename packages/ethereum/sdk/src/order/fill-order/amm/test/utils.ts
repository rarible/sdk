import type { Address } from "@rarible/ethereum-api-client"
import { toAddress } from "@rarible/types"
import type { Ethereum } from "@rarible/ethereum-provider"
import { createSudoswapFactoryV1Contract } from "@rarible/ethereum-sdk-test-common/build/contracts/sudoswap/sudoswap-factory-v1"
import { approveErc721 } from "../../../approve-erc721"
import { mintTestToken } from "../../batch-purchase/test/common/utils"
import type { RaribleSdk } from "../../../../index"
import type { SendFunction } from "../../../../common/send-transaction"

async function createSudoswapPool(
	sellerWeb3: Ethereum,
	send: SendFunction,
	sudoswapFactoryAddress: Address,
	tokenContract: Address,
	tokensIds: string[]
): Promise<Address> {
	const from = toAddress(await sellerWeb3.getFrom())

	const approveTx = await approveErc721(sellerWeb3, send, tokenContract, from, sudoswapFactoryAddress)
	await approveTx?.wait()

	const sudoswapFactory = await createSudoswapFactoryV1Contract(sellerWeb3, sudoswapFactoryAddress)
	const fc = sudoswapFactory.functionCall("createPairETH",
		tokenContract, //nft address
		// EXPONENTIAL_CURVE: 0x0D807bd5fF2C4eF298755bE30E22926b33244B0c
		// LINEAR_CURVE: 0xaC6dcFF6E13132f075e36cA3a7F403236f869438
		// XYK_CURVE: 0x02363a2F1B2c2C5815cb6893Aa27861BE0c4F760
		// "0xaC6dcFF6E13132f075e36cA3a7F403236f869438", //goerli curve
		"0xdd661D1DADdb8F37751a45975C1f4851faFfC9bD", //dev curve
		// "0x42d8004fd14114C989654b825F993cA127EedBce", //dev curve
		from, //_assetRecipient
		1, //_poolType
		"100", //_delta
		0, //_fee
		"1000", //_spotPrice
		tokensIds
	)

	const tx = await send(fc)
	const events = await tx.getEvents()
	const e = events.find((e) => e.event === "NewPair")
	if (!e) {
		throw new Error("No create pair event found")
	}
	return toAddress(e.returnValues.poolAddress)
}

export async function mintTokensToNewSudoswapPool(
	sdk: RaribleSdk,
	erc721Contract: Address,
	sellerWeb3: Ethereum,
	send: SendFunction,
	sudoswapFactoryAddress: Address,
	tokensCount: number = 1
): Promise<{poolAddress: Address, contract: Address, items: string[]}> {
	const tokensPromises = []
	for (let i = 0; i < tokensCount; i++) {
		tokensPromises.push(mintTestToken(sdk, erc721Contract))
	}
	const tokens = await Promise.all(tokensPromises)
	const contract = tokens[0].contract
	const tokensIds = tokens.map((t) => t.tokenId)
	const poolAddress = await createSudoswapPool(
		sellerWeb3,
		send,
		sudoswapFactoryAddress,
		contract,
		tokensIds
	)

	return {
		poolAddress,
		contract,
		items: tokensIds,
	}
}
