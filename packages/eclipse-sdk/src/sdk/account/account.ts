import type { Connection, PublicKey } from "@solana/web3.js"

export interface ITokenAccountRequest {
  mint: PublicKey
  owner: PublicKey
}

export interface IEclipseAccountSdk {
  getTokenAccountForMint(request: ITokenAccountRequest): Promise<PublicKey | undefined>
}

export class EclipseAccountSdk {
  constructor(private readonly connection: Connection) {}

  async getTokenAccountForMint(request: ITokenAccountRequest): Promise<PublicKey | undefined> {
    const tokenAccount = await this.connection.getTokenAccountsByOwner(request.owner, { mint: request.mint })
    return tokenAccount?.value[0]?.pubkey
  }
}
