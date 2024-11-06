export * from "./promise-settled"
export * from "./address"
export * from "./blockchain"
export * from "./retry"
export * from "./get-stringified-data"
export * from "./methods"

export enum DappType {
  AlphaWallet = "AlphaWallet",
  AToken = "AToken",
  Binance = "Binance Smart Wallet",
  Bitpie = "Bitpie",
  BlockWallet = "BlockWallet",
  Brave = "Brave",
  Coinbase = "Coinbase Wallet",
  CoinbaseBrowser = "Coinbase Browser",
  Dcent = "D'CENT",
  Frame = "Frame",
  HuobiWallet = "Huobi Wallet",
  LedgerConnect = "Ledger Connect",
  HyperPay = "HyperPay",
  ImToken = "imToken",
  Liquality = "Liquality",
  MeetOne = "MeetOne",
  Metamask = "Metamask",
  MyKey = "MyKey",
  Opera = "Opera Wallet",
  OwnBit = "OwnBit",
  Status = "Status Wallet",
  Trust = "Trust Wallet",
  TokenPocket = "TokenPocket",
  TP = "TP Wallet",
  WalletIo = "Wallet.io",
  XDEFI = "XDEFI Wallet",
  OneInch = "1inch Wallet",
  Tokenary = "Tokenary Wallet",
  Tally = "Tally Wallet",
  GameStop = "Game Stop",
  Dapper = "Dapper",
  Cipher = "Cipher",
  Mist = "Mist",
  Parity = "Parity",
  Mock = "Mock",
  Generic = "Web3",
  Unknown = "Unknown",
}

export function getDappType(provider: any): DappType | undefined {
  if (!provider) return undefined
  if (provider.isAlphaWallet) return DappType.AlphaWallet
  if (provider.isAToken) return DappType.AToken
  if (provider.bbcSignTx) return DappType.Binance
  if (provider.isBitpie) return DappType.Bitpie
  if (provider.isBlockWallet) return DappType.BlockWallet
  if (provider.isCoinbaseBrowser) return DappType.CoinbaseBrowser
  if (provider.isCoinbaseWallet) return DappType.Coinbase
  if (provider.isDcentWallet) return DappType.Dcent
  if (provider.isFrame) return DappType.Frame
  if (provider.isHbWallet) return DappType.HuobiWallet
  if (provider.isHyperPay) return DappType.HyperPay
  if (provider.isImToken) return DappType.ImToken
  if (provider.isLiquality) return DappType.Liquality
  if (provider.wallet) return DappType.MeetOne
  if (provider.isMYKEY) return DappType.MyKey
  if (provider.isOwnbit) return DappType.OwnBit
  if (provider.isStatus) return DappType.Status
  if (provider.isTrust) return DappType.Trust
  if (provider.isTokenPocket) return DappType.TokenPocket
  if (provider.isTp) return DappType.TP
  if (provider.isWalletIO) return DappType.WalletIo
  if (provider.isXDEFI) return DappType.XDEFI
  if (provider.isOneInchIOSWallet) return DappType.OneInch
  if (provider.isTokenary) return DappType.Tokenary
  if (provider.isTally) return DappType.Tally
  if (provider.isBraveWallet) return DappType.Brave
  if (provider.isOpera) return DappType.Opera
  if (provider.isLedgerConnect) return DappType.LedgerConnect
  if (provider.isMetaMask) return DappType.Metamask
  if (provider.isGamestop) return DappType.GameStop
  if (provider?.constructor?.name === "Web3ProviderEngine") return DappType.Mock
  if (provider?.constructor?.name === "EthereumProvider") return DappType.Mist
  if (provider?.constructor?.name === "Web3FrameProvider") return DappType.Parity
  return DappType.Unknown
}

export function isObjectLike(x: unknown): x is object {
  return typeof x === "object" && x !== null
}

export function hasName(x: unknown): x is Error {
  return isObjectLike(x) && "name" in x
}

export function hasCode(error: unknown): error is { code: number } {
  return isObjectLike(error) && "code" in error
}

export function deepReplaceBigInt(o: unknown): any {
  if (Array.isArray(o)) {
    return o.map(item => deepReplaceBigInt(item))
  }
  if (typeof o === "object" && o !== null) {
    const clonedObject = { ...o } as Record<string, unknown>
    return Object.keys(clonedObject).reduce((acc, key) => {
      acc[key] = deepReplaceBigInt(acc[key])
      return acc
    }, clonedObject)
  }
  if (typeof o === "bigint") return o.toString()
  return o
}

export * from "./types"
export * from "./web3"
