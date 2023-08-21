import type { Request, Response } from "express"
import { toAddress } from "@rarible/types/build/address"
import { getAddressParts, getRaribleSDK } from "../utils"

export async function postFillAction(req: Request, res: Response) {
	try {
		if (!req.body.request || !req.body.from) {
			return res.status(400)
				.json({ message: "body.request or body.from has been missed" })
		}

		const { blockchain, address: from } = getAddressParts(req.body.from)

		if (from === undefined) {
			return res.status(400)
				.json({ message: "body.from should be in union format" })
		}

		switch (blockchain) {
			case "ETHEREUM":
				return ethereumPostFillAction(from, req.body.request, res)
			default:
				return res.status(400)
					.json({ message: "Unsupported blockchain " + blockchain })
		}

	} catch (e) {
		console.error(e)
		return res.status(500)
			.json({ message: "Internal error" })
	}

}

async function ethereumPostFillAction(from: string, request: any, res: Response) {
	if (request.orderId) {

		const { blockchain, address: orderId } = getAddressParts(request.orderId)

		if (!orderId) {
			return res.status(400)
				.json({ message: "body.request.orderId should be in union format" })
		}

		const sdk = getRaribleSDK(blockchain, from)
		try {
			request.order = await sdk.apis.order.getValidatedOrderByHash({
				hash: orderId,
			})
		} catch (e) {
			console.log(e.value)
			return res.status(e.status)
				.json(e.value)
		}
		const txData = await sdk.order.getBuyTxData({ from: toAddress(from), request })
		return res.json(txData)
	}

	return res.status(400)
		.json({ message: "body.request.orderId has been missed" })
}
