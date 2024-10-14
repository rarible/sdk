import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum/build"
import { toEVMAddress } from "@rarible/types"
import type { X2Y2Order } from "@rarible/ethereum-api-client"
import { createRaribleSdk } from "../../index"
import { DEV_PK_1, getE2EConfigByNetwork } from "../../common/test/test-credentials"

// x2y2 works only on mainnet
describe.skip("x2y2", () => {
  const mainnet = getE2EConfigByNetwork("mainnet")
  const { provider: providerBuyer } = createE2eProvider(DEV_PK_1, mainnet)
  const buyerWeb3 = new Web3Ethereum({ web3: new Web3(providerBuyer as any), gas: 3000000 })
  const sdkBuyer = createRaribleSdk(buyerWeb3, "mainnet")

  test("try to fill order", async () => {
    const order = await sdkBuyer.apis.order.getValidatedOrderByHash({
      hash: "0xc58a775f541930cad235d8eb024c8214d01a782d0dd96b109ecc9e47654dc551",
    })
    const tx = await sdkBuyer.order.buy({
      order: order as X2Y2Order,
      amount: 1,
      originFees: [
        {
          account: toEVMAddress("0x0d28e9Bd340e48370475553D21Bd0A95c9a60F92"),
          value: 100,
        },
      ],
    })

    console.log(tx)
  })
})
