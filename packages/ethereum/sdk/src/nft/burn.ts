import type { BigNumber } from "@rarible/types"
import { toAddress, toBigNumber, toBinary } from "@rarible/types"
import { toBn } from "@rarible/utils"
import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { Maybe } from "@rarible/types/build/maybe"
import type {
	Creator,
	EthErc1155AssetType,
	EthErc721AssetType,
	EthErc721LazyAssetType,
	EthErc1155LazyAssetType,
} from "@rarible/api-client"
import type { CheckAssetTypeFunction, NftAssetType } from "../order/check-asset-type"
import type { SendFunction } from "../common/send-transaction"
import type { RaribleEthereumApis } from "../common/apis"
import type { EthereumConfig } from "../config/type"
import {
	createUnionAddressWithChainId,
	createUnionItemId,
	createUnionOwnership,
} from "../common/union-converters"
import { getErc721Contract } from "./contracts/erc721"
import { ERC1155VersionEnum, ERC721VersionEnum } from "./contracts/domain"
import { getErc1155Contract } from "./contracts/erc1155"

export type BurnRequest = {
	assetType: BurnAsset
	amount?: BigNumber
	creators?: Creator[]
}
export type BurnAsset = EthErc721AssetType | EthErc1155AssetType
| NftAssetType | EthErc721LazyAssetType | EthErc1155LazyAssetType

export async function burn(
	ethereum: Maybe<Ethereum>,
	send: SendFunction,
	config: EthereumConfig,
	checkAssetType: CheckAssetTypeFunction,
	apis: RaribleEthereumApis,
	checkWalletChainId: () => Promise<boolean>,
	request: BurnRequest,
): Promise<EthereumTransaction | void> {
	await checkWalletChainId()
	if (!ethereum) {
		throw new Error("Wallet undefined")
	}
	const checked = await checkAssetType(request.assetType)
	const from = toAddress(await ethereum.getFrom())
	const ownership = await apis.nftOwnership.getOwnershipByIdRaw({
		ownershipId: createUnionOwnership(config.chainId, request.assetType.contract, request.assetType.tokenId, from),
	})
	if (ownership.status === 200) {
		const lazyValueBn = toBn(ownership.value.lazyValue)

		if (lazyValueBn.gt(0)) {

			if (!lazyValueBn.isEqualTo(ownership.value.value)) {
				throw new Error("Unable to burn lazy minted item")
			}
			const creators = !request.creators || !request.creators.length
				? [createUnionAddressWithChainId(config.chainId, from)]
				: request.creators?.map(creator => creator.account)
			const signature = await ethereum.personalSign(`I would like to burn my ${request.assetType.tokenId} item.`)
			if (!signature) {
				throw new Error(`burn error: personal signature is empty (${signature})`)
			}
			return apis.nftItem.burnLazyItem({
				lazyItemBurnForm: {
				  id: createUnionItemId(config.chainId, request.assetType.contract, toBigNumber(`${request.assetType.tokenId}`)),
					creators,
					signatures: [
						toBinary(signature),
					],
				},
			})
		}

		switch (checked["@type"]) {
			case "ERC721": {
				const erc721Contract = await getErc721Contract(ethereum, ERC721VersionEnum.ERC721V2, checked.contract)
				return send(erc721Contract.functionCall("burn", checked.tokenId))
			}
			case "ERC1155": {
				if (request.amount) {
					const erc1155Contract = await getErc1155Contract(ethereum, ERC1155VersionEnum.ERC1155V1, checked.contract)
					const owner = await ethereum.getFrom()
					return send(erc1155Contract.functionCall("burn", owner, checked.tokenId, request.amount))
				}
				throw new Error(`amount is ${request.amount}. Amount for burn ERC1155 is required`)
			}
			default: throw new Error("Unexpected asset class")
		}
	}
	throw new Error("Ownership is not found")
}
