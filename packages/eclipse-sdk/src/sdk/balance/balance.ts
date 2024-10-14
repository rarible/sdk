import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import type { Commitment, Connection } from "@solana/web3.js"
import type { PublicKey } from "@solana/web3.js"
import { BigNumber, toBn } from "@rarible/utils"

export interface IEclipseBalancesSdk {
  getBalance(publicKey: PublicKey, options?: { commitment?: Commitment }): Promise<BigNumber>
  getTokenBalance(owner: PublicKey, mint: PublicKey): Promise<BigNumber>
}

export class EclipseBalancesSdk implements IEclipseBalancesSdk {
  constructor(private readonly connection: Connection) {}

  async getBalance(publicKey: PublicKey, options: { commitment?: Commitment } = {}): Promise<BigNumber> {
    const balanceCents = await this.connection.getBalance(publicKey, options.commitment ?? "confirmed")
    return toBn(balanceCents).dividedBy(LAMPORTS_PER_SOL)
  }

  async getTokenBalance(
    owner: PublicKey,
    mint: PublicKey,
    options: { commitment?: Commitment } = {},
  ): Promise<BigNumber> {
    const accounts = await this.connection.getTokenAccountsByOwner(owner, { mint })

    let res = new BigNumber(0)
    for (let tokenAccount of accounts.value) {
      const balance = await this.connection.getTokenAccountBalance(
        tokenAccount.pubkey,
        options.commitment ?? "confirmed",
      )
      res = res.plus(new BigNumber(balance?.value?.uiAmountString ?? 0))
    }
    return res
  }
}
