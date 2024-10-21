import type { Request, Response } from "express"
import { toEVMAddress } from "@rarible/types"
import { getAddressParts, getRaribleSDK } from "../utils"

export async function postFillAction(req: Request, res: Response) {
  try {
    if (!req.body.request || !req.body.from || !req.body.to) {
      return res.status(400).json({ message: "body.request or body.from or body.to has been missed" })
    }

    const from = req.body.from
    if (from === undefined) {
      return res.status(400).json({ message: "body.from should be in request" })
    }

    const to = req.body.to
    if (to === undefined) {
      return res.status(400).json({ message: "body.to should be in request" })
    }

    return ethereumPostFillAction(from, to, req.body.request, res)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: "Internal error" })
  }
}

async function ethereumPostFillAction(from: string, to: string, request: any, res: Response) {
  if (request.orderId) {
    const { blockchain, address: orderId } = getAddressParts(request.orderId)

    if (blockchain !== "ETHEREUM" && blockchain !== "POLYGON" && blockchain !== "MANTLE") {
      return res.status(400).json({ message: "Unsupported blockchain " + blockchain })
    }

    if (!orderId) {
      return res.status(400).json({ message: "body.request.orderId should be in union format" })
    }

    const sdk = getRaribleSDK(blockchain, from)

    try {
      request.order = await sdk.apis.order.getValidatedOrderByHash({
        hash: orderId,
      })
      request.order.taker = to
    } catch (e) {
      console.log(e.value)
      return res.status(e.status).json(e.value)
    }
    const txData = await sdk.order.getBuyTxData({ from: toEVMAddress(from), request })
    return res.json(txData)
  }

  return res.status(400).json({ message: "body.request.orderId has been missed" })
}
