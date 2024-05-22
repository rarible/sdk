//Wallet address 0x76C5855e93bD498B6331652854c4549d34Bc3A30
import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import type { Address } from "@rarible/ethereum-api-client"
import type { E2EProviderConfig } from "../create-e2e-provider"

export const DEV_PK_1 = "26250bb39160076f030517503da31e11aca80060d14f84ebdaced666efb89e21"
//Wallet address 0x00a329c0648769A73afAc7F9381E08FB43dBEA72
export const DEV_PK_2 = "4d5db4107d237df6a3d58ee5f70ae63d73d7658d4026f2eefd2f204c81682cb7"
//Wallet address 0xc41c641b385d05B6Ffc173340126441367A87F83
export const DEV_PK_3 = "064b2a70a2932eb5b45c760b210a2bee579d94031a8c40bff05cfd9d800d6812"
//Wallet address 0xf46c479e32cd7703dd8493979c6042d0e4c0a0db
export const DEV_PK_4 = "ded057615d97f0f1c751ea2795bc4b03bbf44844c13ab4f5e6fd976506c276b9"

export const e2eProviderSupportedNetworks = ["rarible-dev", "mumbai", "polygon", "sepolia", "mainnet"] as const
export type E2EProviderSupportedNetwork = (typeof e2eProviderSupportedNetworks)[number]

const e2eProviderConfigs: Record<E2EProviderSupportedNetwork, Partial<E2EProviderConfig>> = {
  "rarible-dev": {
    rpcUrl: "https://dev-ethereum-node.rarible.com",
    networkId: 300500,
  },
  mumbai: {
    rpcUrl: "https://node-mumbai.rarible.com",
    networkId: 80001,
  },
  polygon: {
    rpcUrl: "https://node-mainnet-polygon.rarible.com",
    networkId: 137,
  },
  sepolia: {
    rpcUrl: "https://testnet.rarible.com/nodes/sepolia-ethereum-node",
    networkId: 11155111,
  },
  mainnet: {
    rpcUrl: "https://node-mainnet.rarible.com",
    networkId: 1,
  },
}

export function getE2EConfigByNetwork(network: E2EProviderSupportedNetwork) {
  return e2eProviderConfigs[network]
}

export const testContractTypes = ["erc721V3", "erc1155V2", "erc20", "sudoswapCurve"] as const
export type TestContractType = (typeof testContractTypes)[number]

export const testContractsNetworks = ["dev-ethereum", "testnet"] as const
export type TestContractsNetwork = (typeof testContractsNetworks)[number]

const testContractsDictionary: Record<TestContractsNetwork, Record<TestContractType, string>> = {
  "dev-ethereum": {
    erc20: "0x0457Df69CaDb8b116E7C9b7c1EA1131cb7C30d10",
    erc721V3: "0x5fc5Fc8693211D29b53C2923222083a81fCEd33c",
    erc1155V2: "0x4733791eED7d0Cfe49eD855EC21dFE5D32447938",
    sudoswapCurve: "0xF3348949Db80297C78EC17d19611c263fc61f987",
  },
  testnet: {
    erc20: ZERO_ADDRESS,
    sudoswapCurve: ZERO_ADDRESS,
    erc721V3: "0x1723017329a804564bC8d215496C89eaBf1F3211",
    erc1155V2: "0xe46D6235f3488B8Ce8AA054e8E5bc0aE86146145",
  },
}

export function getTestContract(env: TestContractsNetwork, contract: TestContractType): Address {
  const envContracts = testContractsDictionary[env]
  if (!envContracts) throw new Error(`Env ${env} hasn't created`)
  if (!envContracts[contract]) throw new Error(`Contract ${contract} in ${env} env hasn't created`)
  return toAddress(envContracts[contract])
}
