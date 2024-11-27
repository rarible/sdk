// import type { Connection, PublicKey } from "@solana/web3.js"
// import type { SolanaSigner } from "@rarible/solana-common"
// import { PreparedTransaction } from "../prepared-transaction"
// import type { DebugLogger } from "../../logger/debug-logger"
// import { getVerifyCollectionInstructions } from "./verifyCollection/verify-collection"
//
// export interface IVerifyCollectionRequest {
//   signer: SolanaSigner
//   mint: PublicKey
//   collection: PublicKey
// }
//
// export interface ISolanaCollectionSdk {
//   verifyCollection(request: IVerifyCollectionRequest): Promise<PreparedTransaction>
// }
//
// export class SolanaCollectionSdk implements ISolanaCollectionSdk {
//   constructor(
//     private readonly connection: Connection,
//     private readonly logger: DebugLogger,
//   ) {}
//
//   async verifyCollection(request: IVerifyCollectionRequest): Promise<PreparedTransaction> {
//     const instructions = await getVerifyCollectionInstructions({
//       connection: this.connection,
//       signer: request.signer,
//       mint: request.mint,
//       collection: request.collection,
//     })
//
//     return new PreparedTransaction(this.connection, instructions, request.signer, this.logger, () => {
//       this.logger.log("Mint", request.mint.toString(), "approved to collection", request.collection.toString())
//     })
//   }
// }
