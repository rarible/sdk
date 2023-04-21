export function getStringifiedData(data: any): string | undefined {
	try {
		if (typeof data === "string") return data
		const errorObject = Object.getOwnPropertyNames(data)
			.reduce((acc, key) => {
				acc[key] = data[key]
				return acc
			}, {} as Record<any, any>)
		return JSON.stringify(errorObject, null, "  ")
	} catch (e) {
		return undefined
	}
}

export enum DappType {
	Metamask = "Metamask",
	Trust = "Trust",
	GoWallet = "GoWallet",
	AlphaWallet = "AlphaWallet",
	Status = "Status",
	Coinbase = "Coinbase",
	Cipher = "Cipher",
	Mist = "Mist",
	Parity = "Parity",
	ImToken = "ImToken",
	Dapper = "Dapper",
	LedgerConnect = "LedgerConnect",
	AToken = "AToken",
	Binance = "Binance Smart Wallet",
	Bitpie = "Bitpie",
	BlockWallet = "BlockWallet",
	Brave = "Brave",
	CoinbaseBrowser = "Coinbase Browser",
	Dcent = "D'CENT",
	Frame = "Frame",
	HuobiWallet = "Huobi Wallet",
	HyperPay = "HyperPay",
	Liquality = "Liquality",
	MeetOne = "MeetOne",
	MetaMask = "MetaMask",
	MyKey = "MyKey",
	Opera = "Opera Wallet",
	OwnBit = "OwnBit",
	TokenPocket = "TokenPocket",
	TP = "TP Wallet",
	WalletIo = "Wallet.io",
	XDEFI = "XDEFI Wallet",
	OneInch = "1inch Wallet",
	Tokenary = "Tokenary Wallet",
	Tally = "Tally Wallet",
	GameStop = "Game Stop",
	Generic = "Web3",
	Mock = "Mock",
	Unknown = "Unknown",
}


export function getDappType(provider: any): DappType | undefined {
	if (provider !== undefined) {
		if (provider) {
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
			if (provider.isMetaMask) return DappType.MetaMask
			if (provider.isGamestop) return DappType.GameStop
			if (provider.isDapper) return DappType.Dapper
			if (provider.isGoWallet) return DappType.GoWallet
			if (typeof (window as any).__CIPHER__ !== "undefined") return DappType.Cipher
			if (provider.constructor.name === "HDWalletProvider") return DappType.Mock
			if (provider.constructor.name === "EthereumProvider") return DappType.Mist
			if (provider.constructor.name === "Web3FrameProvider") return DappType.Parity
			if (provider.constructor.name === "Web3ProviderEngine") return DappType.Mock
			return DappType.Generic
		}
	}

	return undefined
}
