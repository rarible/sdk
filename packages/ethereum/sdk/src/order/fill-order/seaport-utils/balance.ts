import type { Ethereum } from "@rarible/ethereum-provider"
import { toAddress } from "@rarible/types"
import { toBn } from "@rarible/utils"
import type { BigNumber } from "@rarible/utils"
import { createErc20Contract } from "../../contracts/erc20"
import { createErc721Contract } from "../../contracts/erc721"
import { createErc1155Contract } from "../../contracts/erc1155"
import type { InputCriteria, Item } from "./types"
import { isErc1155Item, isErc20Item, isErc721Item } from "./item"
import { ItemType } from "./constants"

export const balanceOf = async (
  ethereum: Ethereum,
  owner: string,
  item: Item,
  criteria?: InputCriteria,
): Promise<BigNumber> => {
  if (isErc721Item(item.itemType)) {
    const erc721 = createErc721Contract(ethereum, toAddress(item.token))

    if (item.itemType === ItemType.ERC721_WITH_CRITERIA) {
      if (criteria) {
        const ownerOf = await erc721.functionCall("ownerOf", criteria.identifier).call()
        return toBn(Number(ownerOf.toLowerCase() === owner.toLowerCase()))
      }
      return toBn(await erc721.functionCall("balanceOf", owner).call())
    }

    const ownerOf = await erc721.functionCall("ownerOf", item.identifierOrCriteria).call()
    return toBn(Number(ownerOf.toLowerCase() === owner.toLowerCase()))
  } else if (isErc1155Item(item.itemType)) {
    const erc1155 = createErc1155Contract(ethereum, toAddress(item.token))

    if (item.itemType === ItemType.ERC1155_WITH_CRITERIA) {
      if (!criteria) {
        const startAmount = toBn(item.startAmount)
        const endAmount = toBn(item.endAmount)

        return startAmount.gt(endAmount) ? startAmount : endAmount
      }
      return toBn(await erc1155.functionCall("balanceOf", owner, criteria.identifier).call())
    }

    return toBn(await erc1155.functionCall("balanceOf", owner, item.identifierOrCriteria).call())
  }

  if (isErc20Item(item.itemType)) {
    const erc20 = createErc20Contract(ethereum, toAddress(item.token))
    return toBn(await erc20.functionCall("balanceOf", owner).call())
  }

  return toBn(await ethereum.getBalance(toAddress(owner)))
}
