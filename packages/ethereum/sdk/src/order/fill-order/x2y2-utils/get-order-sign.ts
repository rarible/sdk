import type { BigNumber, EVMAddress } from "@rarible/types"
import { toBigNumber } from "@rarible/types"
import type { RaribleEthereumApis } from "../../../common/apis"

export class X2Y2Utils {
  static SELL_OP = toBigNumber("1")

  static async getOrderSign(
    apis: RaribleEthereumApis,
    request: {
      sender: EVMAddress
      orderId: BigNumber
      currency: EVMAddress
      price: BigNumber
    },
  ): Promise<string> {
    const res = await apis.orderSignature.orderSignX2Y2({
      x2Y2OrderSignRequest: {
        caller: request.sender,
        op: X2Y2Utils.SELL_OP,
        orderId: request.orderId,
        currency: request.currency,
        price: request.price,
        //tokenId? : BigNumber;
      },
    })
    return res.input
  }
}
