import type { Address, Asset, AssetType } from "@rarible/ethereum-api-client"
import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { Maybe } from "@rarible/types/build/maybe"
import type { TransferProxies } from "../config/type"
import type { SendFunction } from "../common/send-transaction"
import type { GetConfigByChainId } from "../config"
import { approveErc20 } from "./approve-erc20"
import { approveErc721 } from "./approve-erc721"
import { approveErc1155 } from "./approve-erc1155"
import { approveCryptoPunk } from "./approve-crypto-punk"

export type ApproveFunction = (
  owner: Address,
  asset: Asset,
  infinite: undefined | boolean,
) => Promise<EthereumTransaction | undefined>

export async function approve(
  ethereum: Maybe<Ethereum>,
  send: SendFunction,
  getConfig: GetConfigByChainId,
  owner: Address,
  asset: Asset,
  infinite: undefined | boolean = true,
): Promise<EthereumTransaction | undefined> {
  const config = await getConfig()
  const operator = getAssetTransferProxy(asset.assetType.assetClass, config.transferProxies)
  if (!operator) {
    return undefined
  }
  return pureApproveFn({ ethereum, send, operator, owner, asset, infinite })
}

export async function pureApproveFn({
  ethereum,
  send,
  operator,
  owner,
  asset,
  infinite,
}: {
  ethereum: Maybe<Ethereum>
  send: SendFunction
  operator: Address
  owner: Address
  asset: Asset
  infinite: undefined | boolean
}): Promise<EthereumTransaction | undefined> {
  switch (asset.assetType.assetClass) {
    case "ERC20": {
      const contract = asset.assetType.contract
      return approveErc20(
        ethereum,
        send,
        contract,
        owner,
        operator,
        asset.value,
        infinite === undefined ? true : infinite,
      )
    }
    case "ERC721": {
      const contract = asset.assetType.contract
      return approveErc721(ethereum, send, contract, owner, operator)
    }
    case "ERC1155": {
      const contract = asset.assetType.contract
      return approveErc1155(ethereum, send, contract, owner, operator)
    }
    case "ERC721_LAZY":
      const contract = asset.assetType.contract
      return approveErc721(ethereum, send, contract, owner, operator)
    case "ERC1155_LAZY": {
      const contract = asset.assetType.contract
      return approveErc1155(ethereum, send, contract, owner, operator)
    }
    case "CRYPTO_PUNKS": {
      const contract = asset.assetType.contract
      return approveCryptoPunk(ethereum, send, contract, owner, operator, asset.assetType.tokenId)
    }
    default:
      return undefined
  }
}

export function getAssetTransferProxy(assetClass: AssetType["assetClass"], proxies: TransferProxies) {
  switch (assetClass) {
    case "ERC20":
      return proxies.erc20
    case "ERC721":
      return proxies.nft
    case "ERC1155":
      return proxies.nft
    case "ERC721_LAZY":
      return proxies.erc721Lazy
    case "ERC1155_LAZY":
      return proxies.erc1155Lazy
    case "CRYPTO_PUNKS":
      return proxies.cryptoPunks
    default:
      return undefined
  }
}
