import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { Blockchain } from "@rarible/api-client"
import { initProvider } from "./init-providers"

export const ETH_DEV_SETTINGS = {
	rpcUrl: "https://dev-ethereum-node.rarible.com",
	networkId: 300500,
}

export const ETH_GOERLI_SETTINGS = {
	rpcUrl: "https://goerli-ethereum-node.rarible.com",
	networkId: 5,
}

export const ETH_STAGING_SETTINGS = {
	rpcUrl: "https://staging-ethereum-node.rarible.com",
	networkId: 200500,
}

export const POLYGON_MAINNET_SETTINGS = {
	rpcUrl: "https://node-mainnet-polygon.rarible.com",
	networkId: 137,
}

export const ETH_MAINNET_SETTINGS = {
	rpcUrl: "https://rarible.com/nodes/ethereum-node",
	networkId: 1,
}

export const POLYGON_TESTNET_SETTINGS = {
	rpcUrl: "https://node-mumbai.rarible.com",
	networkId: 80001,
}

export const POLYGON_DEV_SETTINGS = {
	rpcUrl: "https://dev-polygon-node.rarible.com",
	networkId: 300501,
}

export const DEV_PK_1 = "0x26250bb39160076f030517503da31e11aca80060d14f84ebdaced666efb89e21"
export const DEV_PK_2 = "0x4d5db4107d237df6a3d58ee5f70ae63d73d7658d4026f2eefd2f204c81682cb7"
export const DEV_PK_3 = "0x796daf08a6c5be4ac868c187eaf42ac8375f532c8f4dc1fb810ba5cd63f948e7"
export const DEV_PK_4 = "0x5eb6e19759f63e7f86e356926e3c1d2edd801bc02087b9f91c4ba97d338101ca"
export const DEV_PK_5 = "0xb0e3767cc906a0bbbdf2e34e5038c103fa8bbcf6757151dde5328a6fe5a3bef1"
export const DEV_PK_6 = "0x9d5616ac28223d91045f8e568b69cdb57bc5d98aafd9399376460a5c9ac5e804"

export function createEthWallet(pk: string): EthereumWallet {
	const { web3, wallet } = initProvider(pk)
	const ethereum = new Web3Ethereum({
		web3: web3,
		from: wallet.getAddressString(),
	})
	return new EthereumWallet(ethereum)
}

export function createEthWallets(num: number) {
	const wallets = [DEV_PK_1, DEV_PK_2, DEV_PK_3, DEV_PK_4, DEV_PK_5, DEV_PK_6]
	return wallets.slice(0, num).map(x => createEthWallet(x))
}

export const devNetworkByBlockchain: Record<Blockchain.ETHEREUM | Blockchain.POLYGON, any> = {
	[Blockchain.ETHEREUM]: ETH_DEV_SETTINGS,
	[Blockchain.POLYGON]: POLYGON_DEV_SETTINGS,
}
