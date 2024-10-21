import fetch from "isomorphic-fetch"
import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { createRaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { Web3Ethereum, Web3 } from "@rarible/web3-ethereum"
import { readEnv } from "./read-env"

export function getRaribleSDK(blockchain: string, from: string): RaribleSdk {
  const rpc = getRpcUrl(blockchain)
  const web3Provider = new Web3(new Web3.providers.HttpProvider(rpc))
  const web3Ethereum = new Web3Ethereum({ web3: web3Provider, from })
  const basePath = getBasePath(blockchain)
  if (basePath) {
    return createRaribleSdk(web3Ethereum, getSdkEnv(blockchain), {
      apiClientParams: {
        fetchApi: fetch,
        basePath: basePath,
      },
      apiKey: process.env.RARIBLE_API_KEY,
    })
  }
  return createRaribleSdk(web3Ethereum, getSdkEnv(blockchain), {
    apiClientParams: {
      fetchApi: fetch,
    },
    apiKey: process.env.RARIBLE_API_KEY,
  })
}

export function getAddressParts(address: string): { blockchain: string; address: string } {
  const parts = address.split(":")

  return {
    blockchain: parts[0],
    address: parts[1],
  }
}

function getRpcUrl(blockchain: string) {
  return readEnv(blockchain.toUpperCase() + "_RPC_URL")
}

function getSdkEnv(blockchain: string) {
  return readEnv(blockchain.toUpperCase() + "_SDK_ENV")
}

function getBasePath(blockchain: string) {
  return readEnv(blockchain.toUpperCase() + "_API_URL")
}
