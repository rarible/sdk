export const solanaKeyKinds = ["privateKey", "arrayPrivateKey"] as const
export type SolanaWalletKeyKind = (typeof solanaKeyKinds)[number]

export type SolanaWalletKeyData<T extends SolanaWalletKeyKind> = {
  privateKey: string
  arrayPrivateKey: Uint8Array
}[T]

export const solanaTestWords = ["test"] as const
export type SolanaTestWord = (typeof solanaTestWords)[number]

export type SolanaWalletMock = {
  publicKeyString: string
  signatures: {
    [K in SolanaTestWord]: {
      array: Uint8Array
      hexString: string
    }
  }
  keys: {
    [K in SolanaWalletKeyKind]: SolanaWalletKeyData<K>
  }
}

const wallet0: SolanaWalletMock = {
  publicKeyString: "2XyukL1KvwDkfNcdBpfXbj6UtPqF7zcUdTDURNjLFAMo",
  signatures: {
    test: {
      hexString:
        "0a47e86157484287bf449fe3b0d56c4478c60628533545752833c895df9999add1b7e50491dc47dbb64d46b3e7d887562bcc580f59533facc68db947dbf89c0a",
      array: Uint8Array.from([
        10, 71, 232, 97, 87, 72, 66, 135, 191, 68, 159, 227, 176, 213, 108, 68, 120, 198, 6, 40, 83, 53, 69, 117, 40,
        51, 200, 149, 223, 153, 153, 173, 209, 183, 229, 4, 145, 220, 71, 219, 182, 77, 70, 179, 231, 216, 135, 86, 43,
        204, 88, 15, 89, 83, 63, 172, 198, 141, 185, 71, 219, 248, 156, 10,
      ]),
    },
  },
  keys: {
    privateKey: "2zCVNyb3KhunreVgamvMPDiFZpkHKHnhNeuyoanQcPaN5yHzKBM8f9PF2h6zSaBm2UUDYf98yBGNS7iRbRHGvYrm",
    arrayPrivateKey: Uint8Array.from([
      99, 87, 171, 135, 138, 126, 92, 128, 190, 64, 22, 156, 36, 13, 155, 14, 214, 77, 78, 101, 109, 150, 94, 234, 196,
      21, 218, 230, 47, 10, 188, 156, 22, 203, 117, 122, 86, 152, 247, 27, 69, 100, 69, 12, 18, 49, 12, 192, 255, 53,
      207, 73, 136, 97, 31, 162, 159, 106, 115, 88, 189, 176, 183, 218,
    ]),
  },
}

export const solanaWalletMocks = {
  0: wallet0,
} as const

export function getSolanaMockWallet<T extends keyof typeof solanaWalletMocks>(index: T): (typeof solanaWalletMocks)[T] {
  return solanaWalletMocks[index]
}
