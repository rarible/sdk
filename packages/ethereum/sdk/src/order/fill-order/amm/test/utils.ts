import type { EVMAddress } from "@rarible/types"
import { toEVMAddress } from "@rarible/types"
import type { Ethereum } from "@rarible/ethereum-provider"
import { createSudoswapFactoryV1Contract } from "@rarible/ethereum-sdk-test-common/build/contracts/sudoswap/sudoswap-factory-v1"
import { approveErc721 } from "../../../approve-erc721"
import { mintTestToken } from "../../batch-purchase/test/common/utils"
import type { RaribleSdk } from "../../../../index"
import type { SendFunction } from "../../../../common/send-transaction"

async function createSudoswapPool(
  sellerWeb3: Ethereum,
  send: SendFunction,
  sudoswapFactoryAddress: EVMAddress,
  sudoswapCurveAddress: EVMAddress,
  tokenContract: EVMAddress,
  tokensIds: string[],
): Promise<EVMAddress> {
  const from = toEVMAddress(await sellerWeb3.getFrom())

  const approveTx = await approveErc721(sellerWeb3, send, tokenContract, from, sudoswapFactoryAddress)
  await approveTx?.wait()

  const sudoswapFactory = await createSudoswapFactoryV1Contract(sellerWeb3, sudoswapFactoryAddress)
  const fc = sudoswapFactory.functionCall(
    "createPairETH",
    tokenContract, //nft address
    sudoswapCurveAddress, //dev curve
    from, //_assetRecipient
    1, //_poolType
    "100", //_delta
    0, //_fee
    "1000", //_spotPrice
    tokensIds,
  )

  const tx = await send(fc)
  const events = await tx.getEvents()
  const e = events.find(e => e.event === "NewPair")
  if (!e) {
    throw new Error("No create pair event found")
  }
  return toEVMAddress(e.returnValues.poolAddress)
}

export async function mintTokensToNewSudoswapPool(
  sdk: RaribleSdk,
  erc721Contract: EVMAddress,
  sellerWeb3: Ethereum,
  send: SendFunction,
  sudoswapFactoryAddress: EVMAddress,
  sudoswapCurveAddress: EVMAddress,
  tokensCount: number = 1,
): Promise<{ poolAddress: EVMAddress; contract: EVMAddress; items: string[] }> {
  const tokensPromises = []
  for (let i = 0; i < tokensCount; i++) {
    tokensPromises.push(mintTestToken(sdk, erc721Contract))
  }
  const tokens = await Promise.all(tokensPromises)
  const contract = tokens[0].contract
  const tokensIds = tokens.map(t => t.tokenId)
  const poolAddress = await createSudoswapPool(
    sellerWeb3,
    send,
    sudoswapFactoryAddress,
    sudoswapCurveAddress,
    contract,
    tokensIds,
  )

  return {
    poolAddress,
    contract,
    items: tokensIds,
  }
}
