import { TezosWallet } from "@rarible/sdk-wallet"
// eslint-disable-next-line camelcase
import { in_memory_provider } from "@rarible/tezos-sdk/dist/providers/in_memory/in_memory_provider"
import { createRaribleSdk } from "@rarible/sdk/build"
import { toCollectionId } from "@rarible/types"
import { updateNodeGlobalVars } from "../common"

updateNodeGlobalVars()

async function mint() {
  const walletEdsk =
    "edskRqrEPcFetuV7xDMMFXHLMPbsTawXZjH9yrEz4RBqH1D6H8CeZTTtjGA3ynjTqD8Sgmksi7p5g3u5KUEVqX2EWrRnq5Bymj"
  const provider = in_memory_provider(walletEdsk, "https://rpc.tzkt.io/ithacanet")
  const wallet = new TezosWallet(provider)
  const sdk = createRaribleSdk(wallet, "testnet")

  const nftCollection = toCollectionId("TEZOS:KT1EreNsT2gXRvuTUrpx6Ju4WMug5xcEpr43")
  const mintResult = await sdk.nft.mint({
    collectionId: nftCollection,
    uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
    royalties: [],
    lazyMint: false,
    supply: 1,
  })
  await mintResult.transaction.wait()
}
mint()
