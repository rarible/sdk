import type { Connection, PublicKey } from "@solana/web3.js"
import type { SolanaSigner } from "@rarible/solana-common"
import { createRevokeInstruction, getAccount, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token"
import type { Account } from "@solana/spl-token/src/state/account"
import { PreparedTransaction } from "../prepared-transaction"
import type { DebugLogger } from "../../logger/debug-logger"

export interface ITokenAccountRequest {
  mint: PublicKey
  owner: PublicKey
}

export interface IAccountInfoRequest {
  tokenAccount: PublicKey
}

export interface IRevokeRequest {
  signer: SolanaSigner
  tokenAccount: PublicKey
}

export interface IEclipseAccountSdk {
  getTokenAccountForMint(request: ITokenAccountRequest): Promise<PublicKey | undefined>

  getAccountInfo(request: IAccountInfoRequest): Promise<Account>

  revokeDelegate(request: IRevokeRequest): PreparedTransaction
}

export class EclipseAccountSdk implements IEclipseAccountSdk {
  constructor(
    private readonly connection: Connection,
    private readonly logger: DebugLogger,
  ) {}

  getAccountInfo(request: IAccountInfoRequest) {
    return getAccount(this.connection, request.tokenAccount, "max", TOKEN_2022_PROGRAM_ID)
  }

  revokeDelegate(request: IRevokeRequest): PreparedTransaction {
    const instructions = [
      createRevokeInstruction(request.tokenAccount, request.signer.publicKey, [], TOKEN_2022_PROGRAM_ID),
    ]

    return new PreparedTransaction(
      this.connection,
      {
        instructions,
        signers: [],
      },
      request.signer,
      this.logger,
      () => {
        this.logger.log(`${request.tokenAccount.toString()} delegation revoked`)
      },
    )
  }

  async getTokenAccountForMint(request: ITokenAccountRequest): Promise<PublicKey | undefined> {
    const tokenAccount = await this.connection.getTokenAccountsByOwner(request.owner, { mint: request.mint })
    return tokenAccount?.value[0]?.pubkey
  }
}
