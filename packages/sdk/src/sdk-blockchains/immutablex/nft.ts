import type { RaribleImxSdk } from "@rarible/immutable-sdk/src/domain"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainImmutableXTransaction } from "@rarible/sdk-transaction"
import { toAddress, toBigNumber } from "@rarible/types"
import { Action } from "@rarible/action"
import type { PrepareTransferRequest, PrepareTransferResponse, TransferRequest } from "../../types/nft/transfer/domain"
import type { PrepareBurnRequest, PrepareBurnResponse } from "../../types/nft/burn/domain"
import type { IApisSdk } from "../../domain"
import type { BurnSimplifiedRequest } from "../../types/nft/burn/simplified"
import type { BurnResponse } from "../../types/nft/burn/domain"
import type { TransferSimplifiedRequest } from "../../types/nft/transfer/simplified"

export class ImxNftService {
  constructor(
    private sdk: RaribleImxSdk,
    private apis: IApisSdk,
  ) {
    this.burn = this.burn.bind(this)
    this.burnBasic = this.burnBasic.bind(this)
    this.transfer = this.transfer.bind(this)
    this.transferBasic = this.transferBasic.bind(this)
  }

  async burnBasic(request: BurnSimplifiedRequest): Promise<BurnResponse> {
    const response = await this.burn(request)
    return response.submit(request)
  }

  async transferBasic(request: TransferSimplifiedRequest): Promise<IBlockchainTransaction> {
    const response = await this.transfer(request)
    return response.submit(request)
  }

  async burn(prepare: PrepareBurnRequest): Promise<PrepareBurnResponse> {
    return {
      multiple: false,
      maxAmount: toBigNumber("1"),
      submit: Action.create({
        id: "burn" as const,
        run: async () => {
          const [, contract, tokenId] = prepare.itemId.split(":")

          const res = await this.sdk.nft.burn({
            assetClass: "ERC721",
            tokenId: toBigNumber(tokenId),
            contract: toAddress(contract),
          })

          return new BlockchainImmutableXTransaction(res.txId)
        },
      }),
    }
  }

  async transfer(prepare: PrepareTransferRequest): Promise<PrepareTransferResponse> {
    return {
      multiple: false,
      maxAmount: toBigNumber("1"),
      submit: Action.create({
        id: "transfer" as const,
        run: async (request: TransferRequest) => {
          const [, contract, tokenId] = prepare.itemId.split(":")
          const [, address] = request.to.split(":")

          const res = await this.sdk.nft.transfer({
            assetClass: "ERC721",
            to: toAddress(address),
            tokenId: toBigNumber(tokenId),
            contract: toAddress(contract),
          })

          return new BlockchainImmutableXTransaction(res.txId)
        },
      }),
    }
  }
}
