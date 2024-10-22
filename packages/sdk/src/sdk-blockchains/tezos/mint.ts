import { Action } from "@rarible/action"
import type { TezosNetwork, TezosProvider } from "@rarible/tezos-sdk"
// eslint-disable-next-line camelcase
import { get_address, mint } from "@rarible/tezos-sdk"
import { toBn } from "@rarible/utils/build/bn"
import { BlockchainTezosTransaction } from "@rarible/sdk-transaction"
import { Blockchain, CollectionType } from "@rarible/api-client"
import type { HasCollection, HasCollectionId, PrepareMintRequest } from "../../types/nft/mint/prepare-mint-request.type"
import type {
  PrepareMintResponse,
  MintResponse,
  OffChainMintResponse,
  OnChainMintResponse,
} from "../../types/nft/mint/prepare"
import { MintType } from "../../types/nft/mint/prepare"
import type { MintRequest } from "../../types/nft/mint/mint-request.type"
import type { PreprocessMetaRequest } from "../../types/nft/mint/preprocess-meta"
import type { MintSimplifiedRequest } from "../../types/nft/mint/simplified"
import type { MintSimplifiedRequestOffChain, MintSimplifiedRequestOnChain } from "../../types/nft/mint/simplified"
import type { IApisSdk } from "../../domain"
import { getContractFromMintRequest } from "../../common/utils"
import type { GeneralMetaRequest } from "../../types/nft/mint/preprocess-meta"
import type { MaybeProvider, TezosMetaContent, TezosMetadataResponse } from "./common"
import { checkChainId, convertTezosItemId, getRequiredProvider, getRoyalties, getTezosAddress } from "./common"
import { getCollectionType } from "./common/get-collection-type"

export class TezosMint {
  constructor(
    private provider: MaybeProvider<TezosProvider>,
    private unionAPI: IApisSdk,
    private network: TezosNetwork,
  ) {
    this.mint = this.mint.bind(this)
    this.mintBasic = this.mintBasic.bind(this)
    this.preprocessMeta = this.preprocessMeta.bind(this)
  }

  private getFormatsMeta(meta: GeneralMetaRequest) {
    return [meta.image, meta.animation].reduce((acc, item) => {
      if (item) {
        const { url, ...rest } = item
        return acc.concat({ ...rest, uri: fixIpfs(url) })
      }
      return acc
    }, [] as TezosMetaContent[])
  }

  public preprocessMeta(meta: PreprocessMetaRequest): TezosMetadataResponse {
    if (meta.blockchain !== Blockchain.TEZOS) {
      throw new Error("Wrong blockchain")
    }

    const artifact = meta.animation || meta.image
    return {
      name: meta.name,
      decimals: 0,
      description: meta.description,
      artifactUri: artifact ? fixIpfs(artifact.url) : undefined,
      displayUri: meta.image ? fixIpfs(meta.image.url) : undefined,
      attributes: meta.attributes?.map(attr => ({
        name: attr.key,
        value: attr.value,
        type: attr.type,
      })),
      formats: this.getFormatsMeta(meta),
    }
  }

  private async getOwner(request: MintRequest): Promise<string> {
    if (request.creators?.length) {
      return getTezosAddress(request.creators[0].account)
    }
    return get_address(getRequiredProvider(this.provider))
  }

  async mint(prepareRequest: PrepareMintRequest): Promise<PrepareMintResponse> {
    await checkChainId(this.provider)

    const { contract, type } = await getCollectionData(this.unionAPI, prepareRequest)

    return {
      multiple: type === CollectionType.TEZOS_MT,
      supportsRoyalties: true,
      supportsLazyMint: false,
      submit: Action.create({
        id: "mint" as const,
        run: async (request: MintRequest) => {
          const royalties = getRoyalties(request.royalties)
          const collectionType = await getCollectionType(this.provider, contract)
          const isNftCollection = collectionType === CollectionType.TEZOS_NFT
          const provider = getRequiredProvider(this.provider)
          const supply = isNftCollection ? undefined : toBn(request.supply || 1)

          if (isNftCollection && request.supply && request.supply > 1) {
            throw new Error(`Invalid supply=${request.supply} for NFT collection, expected supply=1`)
          }

          const result = await mint(
            provider,
            contract,
            royalties,
            supply,
            undefined,
            {
              "": fixIpfs(request.uri),
            },
            await this.getOwner(request),
          )

          return {
            type: MintType.ON_CHAIN,
            transaction: new BlockchainTezosTransaction(result, this.network),
            itemId: convertTezosItemId(`${contract}:${result.token_id}`),
          }
        },
      }),
    }
  }

  // eslint-disable-next-line no-dupe-class-members
  mintBasic(request: MintSimplifiedRequestOnChain): Promise<OnChainMintResponse>
  // eslint-disable-next-line no-dupe-class-members
  mintBasic(request: MintSimplifiedRequestOffChain): Promise<OffChainMintResponse>
  // eslint-disable-next-line no-dupe-class-members
  async mintBasic(request: MintSimplifiedRequest): Promise<MintResponse> {
    const response = await this.mint(request)
    return response.submit(request)
  }
}

export async function getCollectionData(unionAPI: IApisSdk, prepareRequest: HasCollection | HasCollectionId) {
  const contractAddress = getContractFromMintRequest(prepareRequest)
  const [blockchain, contract] = contractAddress.split(":")
  if (blockchain !== Blockchain.TEZOS) {
    throw new Error(`Unsupported blockchain of collection: ${blockchain}`)
  }
  const collection = await unionAPI.collection.getCollectionById({
    collection: contractAddress,
  })
  if (!collection) {
    throw new Error(`Tezos collection with address=${contract} has not been found`)
  }
  return {
    contract,
    owner: collection.owner,
    type: collection.type,
  }
}

function fixIpfs(link: string): string {
  return link.replace("ipfs://ipfs/", "ipfs://")
}
