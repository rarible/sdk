import type { Maybe } from "@rarible/types/build/maybe"
import type { SolanaWallet } from "@rarible/sdk-wallet"
import { Action } from "@rarible/action"
import { toBigNumber, toContractAddress } from "@rarible/types"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainSolanaTransaction } from "@rarible/sdk-transaction"
import type { BurnRequest, BurnResponse, PrepareBurnRequest, PrepareBurnResponse } from "../../types/nft/burn/domain"
import type { IApisSdk } from "../../domain"
import type { PrepareTransferRequest, PrepareTransferResponse, TransferRequest } from "../../types/nft/transfer/domain"
import type { TransferSimplifiedRequest } from "../../types/nft/transfer/simplified"
import type { BurnSimplifiedRequest } from "../../types/nft/burn/simplified"
import { EclipseSdk } from "@rarible/eclipse-sdk"
import { extractPublicKey } from "../solana/common/address-converters"

export class EclipseNft {
  constructor(
    readonly sdk: EclipseSdk,
    readonly wallet: Maybe<SolanaWallet>,
    private readonly apis: IApisSdk,
  ) {
    this.burn = this.burn.bind(this)
    this.burnBasic = this.burnBasic.bind(this)
    this.transfer = this.transfer.bind(this)
    this.transferBasic = this.transferBasic.bind(this)
  }

  async burn(prepare: PrepareBurnRequest): Promise<PrepareBurnResponse> {
    if (!this.wallet) {
      throw new Error("Solana wallet not provided")
    }

    const item = await this.apis.item.getItemById({ itemId: prepare.itemId })

    if (!item) {
      throw new Error(`Item with id ${prepare.itemId} not found`)
    }

    return {
      multiple: parseFloat(item.supply) > 1,
      maxAmount: toBigNumber(item.supply),
      nftData: {
        nftCollection: item.collection && toContractAddress(item.collection),
      },
      submit: Action.create({
        id: "burn" as const,
        run: async (request: BurnRequest) => {
          const amount = request?.amount ?? 1
          const mint = extractPublicKey(item.id)

          const prepare = await this.sdk.nft.burn({
            mint: mint,
            signer: this.wallet!.provider,
            amount: amount,
            owner: this.wallet!.provider.publicKey,
          })
          const tx = await prepare.submit("processed")

          return new BlockchainSolanaTransaction(tx, this.sdk)
        },
      }),
    }
  }

  async burnBasic(request: BurnSimplifiedRequest): Promise<BurnResponse> {
    const response = await this.burn(request)
    return response.submit(request)
  }

  async transfer(prepare: PrepareTransferRequest): Promise<PrepareTransferResponse> {
    if (!this.wallet) {
      throw new Error("Solana wallet not provided")
    }

    const item = await this.apis.item.getItemById({ itemId: prepare.itemId })

    if (!item) {
      throw new Error(`Item with id ${prepare.itemId} not found`)
    }

    return {
      multiple: parseFloat(item.supply) > 1,
      maxAmount: toBigNumber(item.supply),
      nftData: {
        nftCollection: item.collection ? toContractAddress(item.collection) : undefined,
      },
      submit: Action.create({
        id: "transfer" as const,
        run: async (request: TransferRequest) => {
          const amount = request?.amount ?? 1
          const mint = extractPublicKey(item.id)

          const prepare = await this.sdk.nft.transfer({
            mint: mint,
            signer: this.wallet!.provider,
            amount: amount,
            to: extractPublicKey(request.to),
            owner: this.wallet!.provider.publicKey,
          })
          const tx = await prepare.submit("processed")

          return new BlockchainSolanaTransaction(tx, this.sdk)
        },
      }),
    }
  }

  async transferBasic(request: TransferSimplifiedRequest): Promise<IBlockchainTransaction> {
    const response = await this.transfer(request)
    return response.submit(request)
  }
}
