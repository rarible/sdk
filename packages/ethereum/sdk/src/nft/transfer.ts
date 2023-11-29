import type {
	EthErc1155AssetType, EthErc1155LazyAssetType,
	EthErc721AssetType, EthErc721LazyAssetType,
	ItemControllerApi,
	OwnershipControllerApi,
	UnionAddress,
} from "@rarible/api-client"
import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { BigNumber } from "@rarible/types"
import { toAddress, toBigNumber } from "@rarible/types"
import { toBn } from "@rarible/utils/build/bn"
import type { Maybe } from "@rarible/types/build/maybe"
import { convertToEVMAddress } from "@rarible/sdk-common"
import type { CheckAssetTypeFunction, NftAssetType } from "../order/check-asset-type"
import { getOwnershipId } from "../common/get-ownership-id"
import type { SendFunction } from "../common/send-transaction"
import type { EthereumConfig } from "../config/type"
import { transferErc721 } from "./transfer-erc721"
import { transferErc1155 } from "./transfer-erc1155"
import { transferNftLazy } from "./transfer-nft-lazy"
import { transferCryptoPunk } from "./transfer-crypto-punk"

export type TransferAsset = NftAssetType | EthErc721AssetType | EthErc721LazyAssetType
| EthErc1155AssetType | EthErc1155LazyAssetType

export async function transfer(
	ethereum: Maybe<Ethereum>,
	send: SendFunction,
	config: EthereumConfig,
	checkAssetType: CheckAssetTypeFunction,
	nftItemApi: ItemControllerApi,
	nftOwnershipApi: OwnershipControllerApi,
	checkWalletChainId: () => Promise<boolean>,
	initialAsset: TransferAsset,
	to: UnionAddress,
	amount?: BigNumber
): Promise<EthereumTransaction> {
	await checkWalletChainId()
	if (!ethereum) {
		throw new Error("Wallet undefined")
	}
	const recipient = convertToEVMAddress(to)
	const from = toAddress(await ethereum.getFrom())
	const ownership = await nftOwnershipApi.getOwnershipByIdRaw({
		ownershipId: getOwnershipId(initialAsset.contract, toBigNumber(`${initialAsset.tokenId}`), from),
	})
	if (ownership.status === 200) {
		const asset = await checkAssetType(initialAsset)
		if (toBn(ownership.value.lazyValue).gt(0)) {
			if (asset["@type"] === "CRYPTO_PUNKS") {
				throw new Error("CRYPTO_PUNKS can't be lazy")
			}
			if (asset["@type"] === "COLLECTION") {
				throw new Error("Transfer asset class cannot be as collection")
			}
			return transferNftLazy(
				ethereum,
				send,
				nftItemApi,
				config.chainId,
				asset,
				toAddress(from),
				recipient,
				amount
			)
		}
		switch (asset["@type"]) {
			case "ERC721": return transferErc721(ethereum, send, asset.contract, from, recipient, asset.tokenId)
			case "ERC1155": return transferErc1155(ethereum, send, asset.contract, from, recipient, asset.tokenId, amount || "1")
			case "CRYPTO_PUNKS": return transferCryptoPunk(ethereum, send, asset.contract, recipient, asset.tokenId)
			default:
				throw new Error(
					`Not supported asset: ${JSON.stringify(asset)}`
				)
		}
	} else {
		throw new Error(`Address ${from} has not any ownerships of token with Id ${initialAsset.tokenId}`)
	}
}
