import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { Address, UnionAddress } from "@rarible/types"
import { createTestErc1155 } from "@rarible/ethereum-sdk-test-common"
import type { ItemId } from "@rarible/api-client"
import { toAddress } from "@rarible/types"
import type { BigNumberValue } from "@rarible/utils"
import { isRealBlockchainSpecified } from "@rarible/types/build/blockchains"
import { retry } from "../../../common/retry"
import { convertToEthereumAddress, getEthereumItemId } from "../common"

export async function awaitErc1155Balance(
  eth: EthereumWallet,
  itemId: ItemId,
  recipient: UnionAddress | Address | string,
  balance: BigNumberValue,
) {
  const { contract, tokenId } = getEthereumItemId(itemId)
  let rawRecipient: Address
  if (isRealBlockchainSpecified(recipient)) {
    rawRecipient = convertToEthereumAddress(recipient as UnionAddress)
  } else if (recipient.startsWith("0x")) {
    rawRecipient = recipient as Address
  }
  const erc1155Contract = createTestErc1155((eth.ethereum as any).config.web3, toAddress(contract))
  await retry(10, 1000, async () => {
    const balanceRecipient = await erc1155Contract.methods.balanceOf(rawRecipient, tokenId).call()
    expect(balanceRecipient).toBe(balance.toString())
  })
}
