import type { Address } from "@rarible/ethereum-api-client"
import { toAddress } from "@rarible/types"
import type { EthereumNetwork } from "../../types"

export const DEV_PK_1 = "0x26250bb39160076f030517503da31e11aca80060d14f84ebdaced666efb89e21"
export const DEV_PK_2 = "0x4d5db4107d237df6a3d58ee5f70ae63d73d7658d4026f2eefd2f204c81682cb7"
export const DEV_PK_3 = "0x064b2a70a2932eb5b45c760b210a2bee579d94031a8c40bff05cfd9d800d6812"

export const MUMBAI_CONFIG = {
	rpcUrl: "https://node-mumbai.rarible.com",
	networkId: 80001,
}

export const POLYGON_CONFIG = {
	rpcUrl: "https://node-mainnet-polygon.rarible.com",
	networkId: 137,
}

export const GOERLI_CONFIG = {
	rpcUrl: "https://goerli-ethereum-node.rarible.com",
	networkId: 5,
}

export const MAINNET_CONFIG = {
	rpcUrl: "https://node-mainnet.rarible.com",
	networkId: 1,
}

export type TestContractType = "erc721V3" | "erc1155V2" | "erc20Mintable"

type PartialRecord<K extends keyof any, T> =  Partial<Record<K, T>>

const MAP_TEST_CONTRACTS: PartialRecord<EthereumNetwork, Record<TestContractType, string>> = {
	"dev-ethereum": {
		erc721V3: "0xf9864189fe52456345DD0055D210fD160694Dd08",
		erc1155V2: "0x11F13106845CF424ff5FeE7bAdCbCe6aA0b855c1",
		erc20Mintable: "0xA4A70E8627e858567a9f1F08748Fe30691f72b9e",
	},
	"testnet": {
		erc721V3: "0x1723017329a804564bC8d215496C89eaBf1F3211",
		erc1155V2: "0xe46D6235f3488B8Ce8AA054e8E5bc0aE86146145",
		erc20Mintable: "",
	},
	"staging": {
		erc721V3: "0x2BCCacA812c8FF9003b2bEA778421551f58Ed11b",
		erc1155V2: "0xf33F626ca16cE18eF0052ECa6Ed6fC97Cedf031D",
		erc20Mintable: "0x31C827f06E10e4999eb88c193669d408eF597B3D",
	},
}

export function getTestContract(env: EthereumNetwork, contract: TestContractType): Address {
	const envContracts = MAP_TEST_CONTRACTS[env]
	if (!envContracts) {
		throw new Error(`Env ${env} hasn't created`)
	}
	if (!envContracts[contract]) {
		throw new Error(`Contract ${contract} in ${env} env hasn't created`)
	}
	return toAddress(envContracts[contract])
}
