import type { ContractAddress } from "@rarible/types"
import type { RaribleSdkEnvironment } from "../../../config/domain"
import { convertTezosToContractAddress } from "../common"

export type contractType = "eurTzContract" | "fa12Contract" | "nftContract" | "mtContract"

export function getTestContract(env: RaribleSdkEnvironment, type: contractType): ContractAddress {
	switch (env) {
		case "development": {
			const contracts: Record<contractType, string> = {
				eurTzContract: "KT1HvTfYG7DgeujAQ1LDvCHiQc29VMycoJh5",
				fa12Contract: "KT1X9S5Z69r36kToUx2xSi32gmhRjEW64dMS",
				nftContract: "KT1PuABq2ReD789KtKetktvVKJcCMpyDgwUx",
				mtContract: "KT1DqmzJCkUQ8xAqeKzz9L4g4owLiQj87XaC",
			}
			return convertTezosToContractAddress(contracts[type])
		}
		case "testnet": {
			const contracts: Record<contractType, string> = {
				eurTzContract: "KT1PEBh9oKkQosYuw4tvzigps5p7uqXMgdez",
				fa12Contract: "KT1WsXMAzcre2MNUjNkGtVQLpsTnNFhBJhLv",
				nftContract: "KT1DtQV5qTnxdG49GbMRdKC8fg7bpvPLNcpm",
				mtContract: "KT1Uke8qc4YTfP41dGuoGC8UsgRyCtyvKPLA",
			}
			return convertTezosToContractAddress(contracts[type])
		}
		case "dev":
		case "staging": {
			const contracts: Record<contractType, string> = {
				eurTzContract: "KT1PEBh9oKkQosYuw4tvzigps5p7uqXMgdez",
				fa12Contract: "KT1WsXMAzcre2MNUjNkGtVQLpsTnNFhBJhLv",
				nftContract: "KT1UiWhFgLBbTRPd9h9Zym34sFhTiuwDayqH",
				mtContract: "KT1Uke8qc4YTfP41dGuoGC8UsgRyCtyvKPLA",
			}
			return convertTezosToContractAddress(contracts[type])
		}
		case "prod": {
			const contracts: Record<contractType, string> = {
				eurTzContract: "",
				fa12Contract: "KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW",
				nftContract: "",
				mtContract: "KT18pVpRXKPY2c4U2yFEGSH3ZnhB2kL8kwXS",
			}
			return convertTezosToContractAddress(contracts[type])
		}
		default: throw new Error("Unrecognized env")
	}

}
