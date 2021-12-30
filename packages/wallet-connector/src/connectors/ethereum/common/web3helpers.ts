type RpcProvider = {
	sendAsync: (payload: {method: string}, callback: (error: any, res: any) => void) => void
}

export function getWeb3Accounts(provider: RpcProvider): Promise<string[]> {
	return new Promise<string[]>((resolve, reject) => {
		provider.sendAsync({ method: "eth_accounts" }, (error: any, res: any) => {
			if (error) {
				reject(error.message)
			} else {
				resolve(res.result)
			}
		})
	})
}

export function getWeb3ChainId(provider: RpcProvider): Promise<number> {
	return new Promise((resolve, reject) => {
		provider.sendAsync({ method: "eth_chainId" }, (error: any, res: any) => {
			if (error) {
				reject(error.message)
			} else {
				resolve(parseInt((res as any).result))
			}
		})
	})
}