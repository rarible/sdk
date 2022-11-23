import { keccak256 } from "ethereumjs-util"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { BigNumber } from "@rarible/types"
import type { AssetType, Part } from "@rarible/ethereum-api-client"
import type { Maybe } from "@rarible/types/build/maybe"
import type { Auction } from "@rarible/ethereum-api-client/build/models"
import { id } from "../../common/id"
import type { EthereumConfig } from "../../config/type"
import { addFee } from "../../order/add-fee"

export function getAuctionOperationOptions(buyAssetType: AssetType, value: BigNumber, fee: number) {
	if (buyAssetType.assetClass === "ETH") {
		const totalValue = addFee({ assetType: buyAssetType, value }, fee)
		return { value: totalValue.value }
	}
	return {}
}

export function getAuctionHash(
	ethereum: Maybe<Ethereum>,
	config: EthereumConfig,
	auctionId: BigNumber,
): string {
	if (!ethereum) {
		throw new Error("Wallet is undefined")
	}
	const hash = ethereum.encodeParameter(AUCTION_HASH_TYPE, {
		contractAddress: config.auction,
		auctionId: auctionId,
	})
	return `0x${keccak256(Buffer.from(hash.substring(2), "hex")).toString("hex")}`
}

export function getAssetEncodedData(
	ethereum: Ethereum,
	asset: AssetType
): string {
	switch (asset.assetClass) {
		case "ETH": {
			return "0x"
		}
		case "ERC20": {
			return ethereum.encodeParameter("address", asset.contract)
		}
		case "ERC721":
		case "ERC1155": {
			return ethereum.encodeParameter({
				components: [
					{
						name: "contractAddress",
						type: "address",
					},
					{
						name: "tokenId",
						type: "uint256",
					},
				],
				name: "data",
				type: "tuple",
			}, {
				contractAddress: asset.contract,
				tokenId: asset.tokenId,
			})
		}
		default:
			throw new Error("Unrecognized asset for auction")
	}
}

export function validateAuctionRangeTime(auction: Auction): boolean {
	if (auction.data.startTime) {
		const startTime = new Date(auction.data.startTime).getTime()
		if (startTime > 0 && startTime > Date.now()) {
			return false
		}
	}
	if (auction.endTime) {
		const endTime = new Date(auction.endTime).getTime()

		if (endTime > 0 && endTime < Date.now()) {
			return false
		}
	}
	return true
}

export function calculatePartsSum(parts?: Part[]): number {
	return (parts || [])
		.map(f => f.value)
		.reduce((v, acc) => v + acc, 0)
}

export const AUCTION_DATA_TYPE = id("V1")

export const AUCTION_HASH_TYPE = {
	components: [
		{
			name: "contractAddress",
			type: "address",
		},
		{
			name: "auctionId",
			type: "uint256",
		},
	],
	name: "data",
	type: "tuple",
}

export const AUCTION_BID_DATA_V1 = {
	components: [
		{
			components: [
				{
					name: "account",
					type: "address",
				},
				{
					name: "value",
					type: "uint96",
				},
			],
			name: "payouts",
			type: "tuple[]",
		},
		{
			components: [
				{
					name: "account",
					type: "address",
				},
				{
					name: "value",
					type: "uint96",
				},
			],
			name: "originFees",
			type: "tuple[]",
		},
	],
	name: "data",
	type: "tuple",
}


export const AUCTION_DATA_V1 = {
	components: [
		{
			components: [
				{
					name: "account",
					type: "address",
				},
				{
					name: "value",
					type: "uint96",
				},
			],
			name: "payouts",
			type: "tuple[]",
		},
		{
			components: [
				{
					name: "account",
					type: "address",
				},
				{
					name: "value",
					type: "uint96",
				},
			],
			name: "originFees",
			type: "tuple[]",
		},
		{
			name: "duration",
			type: "uint96",
		},
		{
			name: "startTime",
			type: "uint96",
		},
		{
			name: "buyOutPrice",
			type: "uint96",
		},
	],
	name: "data",
	type: "tuple",
}
