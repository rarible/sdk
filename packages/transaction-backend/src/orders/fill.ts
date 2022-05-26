import type { Request, Response } from "express"
import fetch from "node-fetch"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { createRaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import { toAddress } from "@rarible/types/build/address"
import { getAddressParts, web3Provider } from "../utils"

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
	const web3Ethereum = new Web3Ethereum({ web3: web3Provider, from })
	const sdk = createRaribleSdk(web3Ethereum, process.env.SDK_ENV as EthereumNetwork, {
		apiClientParams: {
			fetchApi: fetch,
		},
	})

	if (request.orderId) {
		const { address: orderId } = getAddressParts(request.orderId)

		if (!orderId) {
			return res.status(400)
				.json({ message: "body.request.orderId should be in union format" })
		}

		request.order = await sdk.apis.order.getOrderByHash({
			hash: orderId,
		})
	}

	const txData = await sdk.order.getBuyTxData({ from: toAddress(from), request })
	return res.json(txData)
}
