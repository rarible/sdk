import { Connection, PublicKey } from "@solana/web3.js"
import { BigNumberValue, toBn } from "@rarible/utils"
import type { SolanaSigner } from "@rarible/solana-common"
import type { DebugLogger } from "../../logger/debug-logger"
import type { IEclipseAccountSdk } from "../account/account"
import { PreparedTransaction } from "../prepared-transaction"
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createBurnInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token"

export interface ITransferRequest {
  signer: SolanaSigner
  tokenAccount?: PublicKey
  owner: PublicKey
  to: PublicKey
  mint: PublicKey
  amount: BigNumberValue
}

export interface IBurnRequest {
  signer: SolanaSigner
  mint: PublicKey
  amount: BigNumberValue
  tokenAccount?: PublicKey
  owner: PublicKey
}

export interface IEclipseNftSdk {
  transfer(request: ITransferRequest): Promise<PreparedTransaction>

  burn(request: IBurnRequest): Promise<PreparedTransaction>
}

export class EclipseNftSdk implements IEclipseNftSdk {
  constructor(
    private readonly connection: Connection,
    private readonly logger: DebugLogger,
    private readonly accountSdk: IEclipseAccountSdk,
  ) {}

  async transfer(request: ITransferRequest): Promise<PreparedTransaction> {
    const sourceTokenAccount =
      request.tokenAccount ??
      (await this.accountSdk.getTokenAccountForMint({
        owner: request.owner,
        mint: request.mint,
      }))

    if (!sourceTokenAccount) {
      throw new Error("Can't find current token account for for mint")
    }

    const tokenAmountToTransfer = toBn(request.amount).toNumber() ?? 1

    const destinationTokenAccount = await getAssociatedTokenAddress(
      request.mint,
      request.to,
      false,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    )

    const instructions = []

    const accountInfo = await this.connection.getAccountInfo(destinationTokenAccount)
    if (accountInfo === null) {
      instructions.push(
        createAssociatedTokenAccountInstruction(
          request.signer.publicKey,
          destinationTokenAccount,
          request.to,
          request.mint,
          TOKEN_2022_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID,
        ),
      )
    }

    instructions.push(
      createTransferInstruction(
        sourceTokenAccount,
        destinationTokenAccount,
        request.owner,
        tokenAmountToTransfer,
        [],
        TOKEN_2022_PROGRAM_ID,
      ),
    )

    const preparedInstructions = {
      instructions,
      signers: [request.signer],
    }

    return new PreparedTransaction(this.connection, preparedInstructions, request.signer, this.logger, () => {
      this.logger.log(
        `${request.amount.toString()} token(s) ${request.mint.toString()} transferred to ${request.to.toString()}`,
      )
    })
  }

  async burn(request: IBurnRequest): Promise<PreparedTransaction> {
    const tokenAccount =
      request.tokenAccount ??
      (await this.accountSdk.getTokenAccountForMint({
        owner: request.owner,
        mint: request.mint,
      }))

    if (!tokenAccount) {
      throw new Error("Can't find current token account for for mint")
    }

    const tokenAmountToBurn = toBn(request.amount).toNumber() ?? 1

    const instructions = {
      instructions: [
        createBurnInstruction(tokenAccount, request.mint, request.owner, tokenAmountToBurn, [], TOKEN_2022_PROGRAM_ID),
      ],
      signers: [request.signer],
    }

    return new PreparedTransaction(this.connection, instructions, request.signer, this.logger, () => {
      this.logger.log(`${request.amount.toString()} token(s) ${request.mint.toString()} burned`)
    })
  }
}
