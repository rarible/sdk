import type {
	Address,
	Erc1155AssetType,
	Erc721AssetType,
	NftItemControllerApi,
	NftOwnershipControllerApi,
} from "@rarible/ethereum-api-client"
import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { BigNumber } from "@rarible/types"
import { toAddress, toBigNumber } from "@rarible/types"
import { toBn } from "@rarible/utils/build/bn"
import type { Maybe } from "@rarible/types/build/maybe"
import type { CheckAssetTypeFunction, NftAssetType } from "../order/check-asset-type"
import { getOwnershipId } from "../common/get-ownership-id"
import type { SendFunction } from "../common/send-transaction"
import { transferErc721 } from "./transfer-erc721"
import { transferErc1155 } from "./transfer-erc1155"
import { transferNftLazy } from "./transfer-nft-lazy"
import { transferCryptoPunk } from "./transfer-crypto-punk"

export type TransferAsset = NftAssetType | Erc721AssetType | Erc1155AssetType

export async function transfer(
	ethereum: Maybe<Ethereum>,
	send: SendFunction,
	checkAssetType: CheckAssetTypeFunction,
	nftItemApi: NftItemControllerApi,
	nftOwnershipApi: NftOwnershipControllerApi,
	checkWalletChainId: () => Promise<boolean>,
	initialAsset: TransferAsset,
	to: Address,
	amount?: BigNumber
): Promise<EthereumTransaction> {
	await checkWalletChainId()
	if (!ethereum) {
		throw new Error("Wallet undefined")
	}
	const from = toAddress(await ethereum.getFrom())
	const ownership = await nftOwnershipApi.getNftOwnershipByIdRaw({
		ownershipId: getOwnershipId(initialAsset.contract, toBigNumber(`${initialAsset.tokenId}`), from),
	})
	if (ownership.status === 200) {
		const asset = await checkAssetType(initialAsset)
		if (toBn(ownership.value.lazyValue).gt(0)) {
			if (asset.assetClass === "CRYPTO_PUNKS") {
				throw new Error("CRYPTO_PUNKS can't be lazy")
			}
			if (asset.assetClass === "COLLECTION") {
				throw new Error("Transfer asset class cannot be as collection")
			}
			return transferNftLazy(
				ethereum,
				send,
				nftItemApi,
				asset,
				toAddress(from), to, amount
			)
		}
		switch (asset.assetClass) {
			case "ERC721": return transferErc721(ethereum, send, asset.contract, from, to, asset.tokenId)
			case "ERC1155": return transferErc1155(ethereum, send, asset.contract, from, to, asset.tokenId, amount || "1")
			case "CRYPTO_PUNKS": return transferCryptoPunk(ethereum, send, asset.contract, to, asset.tokenId)
			default:
				throw new Error(
					`Not supported asset: ${JSON.stringify(asset)}`
				)
		}
	} else {
		throw new Error(`Address ${from} has not any ownerships of token with Id ${initialAsset.tokenId}`)
	}
}
