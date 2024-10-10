import { createTestErc721 } from "@rarible/ethereum-sdk-test-common"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { UnionAddress } from "@rarible/types"
import type { ItemId } from "@rarible/api-client"
import { toEVMAddress } from "@rarible/types"
import { retry } from "../../../common/retry"
import { convertToEthereumAddress, getEthereumItemId } from "../common"

export async function awaitErc721Balance(eth: EthereumWallet, itemId: ItemId, recipient: UnionAddress) {
  const { contract } = getEthereumItemId(itemId)
  const rawRecipient = convertToEthereumAddress(recipient)
  const erc721Contract = createTestErc721((eth.ethereum as any).config.web3, toEVMAddress(contract))
  await retry(10, 1000, async () => {
    const balanceRecipient = await erc721Contract.methods.balanceOf(rawRecipient).call()
    expect(balanceRecipient).toBe("1")
  })
}
