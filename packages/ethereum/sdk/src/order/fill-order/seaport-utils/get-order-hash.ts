import { keccak256, keccakFromHexString } from "ethereumjs-util"
import { toBn } from "@rarible/utils"
import type { OrderComponents } from "./types"

export function getOrderHash(orderComponents: OrderComponents): string {
	const offerItemTypeString =
    "OfferItem(uint8 itemType,address token,uint256 identifierOrCriteria,uint256 startAmount,uint256 endAmount)"
	const considerationItemTypeString =
    "ConsiderationItem(uint8 itemType,address token,uint256 identifierOrCriteria,uint256 startAmount,uint256 endAmount,address recipient)"
	const orderComponentsPartialTypeString =
    "OrderComponents(address offerer,address zone,OfferItem[] offer,ConsiderationItem[] consideration,uint8 orderType,uint256 startTime,uint256 endTime,bytes32 zoneHash,uint256 salt,bytes32 conduitKey,uint256 counter)"
	const orderTypeString = `${orderComponentsPartialTypeString}${considerationItemTypeString}${offerItemTypeString}`

	const offerItemTypeHash = getStringHash(offerItemTypeString)

	const considerationItemTypeHash = getStringHash(considerationItemTypeString)

	const orderTypeHash = getStringHash(orderTypeString)

	const offerHash = "0x" + keccakFromHexString(
		"0x" +
    orderComponents.offer
    	.map((offerItem) => {
    		const stringForHashing = "0x" +
          [
          	offerItemTypeHash.slice(2),
          	offerItem.itemType.toString().padStart(64, "0"),
          	offerItem.token.slice(2).padStart(64, "0"),
          	toBn(offerItem.identifierOrCriteria)
          		.toString(16)
          		.padStart(64, "0"),
          	toBn(offerItem.startAmount)
          		.toString(16)
          		.padStart(64, "0"),
          	toBn(offerItem.endAmount)
          		.toString(16)
          		.padStart(64, "0"),
          ].join("")
    		return keccakFromHexString(stringForHashing).toString("hex")
    	})
    	.join("")
	).toString("hex")

	const considerationHash = "0x" + keccakFromHexString(
		"0x" +
    orderComponents.consideration
    	.map((considerationItem) => {
    		return keccakFromHexString(
    				"0x" +
            [
            	considerationItemTypeHash.slice(2),
            	considerationItem.itemType.toString().padStart(64, "0"),
            	considerationItem.token.slice(2).padStart(64, "0"),
            	toBn(
            		considerationItem.identifierOrCriteria
            	)
            		.toString(16)
            		.padStart(64, "0"),
            	toBn(considerationItem.startAmount)
            		.toString(16)
            		.padStart(64, "0"),
            	toBn(considerationItem.endAmount)
            		.toString(16)
            		.padStart(64, "0"),
            	considerationItem.recipient.slice(2).padStart(64, "0"),
            ].join("")
    			).toString("hex")
    	})
    	.join("")
	).toString("hex")

	const derivedOrderHash = keccakFromHexString(
		"0x" +
    [
    	orderTypeHash.slice(2),
    	orderComponents.offerer.slice(2).padStart(64, "0"),
    	orderComponents.zone.slice(2).padStart(64, "0"),
    	offerHash.slice(2),
    	considerationHash.slice(2),
    	orderComponents.orderType.toString().padStart(64, "0"),
    	toBn(orderComponents.startTime)
    		.toString(16)
    		.padStart(64, "0"),
    	toBn(orderComponents.endTime)
    		.toString(16)
    		.padStart(64, "0"),
    	orderComponents.zoneHash.slice(2),
    	orderComponents.salt.slice(2).padStart(64, "0"),
    	orderComponents.conduitKey.slice(2).padStart(64, "0"),
    	toBn(orderComponents.counter)
    		.toString(16)
    		.padStart(64, "0"),
    ].join("")
	).toString("hex")

	return `0x${derivedOrderHash}`
}

export function getStringHash(str: string) {
	return `0x${keccak256(Buffer.from(str)).toString("hex")}`
}
