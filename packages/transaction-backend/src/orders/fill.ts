import type { Request, Response } from "express"
import fetch from "node-fetch"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { createRaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import { web3Provider } from "../utils"

export async function postFillAction(req: Request, res: Response) {
	try {
		if (!req.body.request || !req.body.from) {
			return res.status(400)
				.json({ message: "body.request or body.from has been missed" })
		}
		const { from, request } = req.body
		const web3Ethereum = new Web3Ethereum({ web3: web3Provider, from })
		const sdk = createRaribleSdk(web3Ethereum, process.env.SDK_ENV as EthereumNetwork, {
			apiClientParams: {
				fetchApi: fetch,
			},
		})

		if (request.orderId) {
			request.order = await sdk.apis.order.getOrderByHash({
				hash: request.orderId,
			})
		}

		const txData = await sdk.order.getBuyTxData({ from, request })
		return res.json(txData)
	} catch (e) {
		console.error(e)
		return res.status(500)
			.json({ message: "Internal error" })
	}

}
