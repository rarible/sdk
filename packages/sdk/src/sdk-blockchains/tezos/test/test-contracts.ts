import type { UnionContractAddress } from "@rarible/api-client"
import type { RaribleSdkEnvironment } from "../../../config/domain"
import { convertTezostoUnionContractAddress } from "../common"

export type contractType =
  | "eurTzContract"
  | "fa12Contract"
  | "nftContract"
  | "nftContract1"
  | "mtContract"
  | "mtContract1"

export function getTestContract(env: RaribleSdkEnvironment, type: contractType): UnionContractAddress {
  switch (env) {
    case "development": {
      const contracts: Record<contractType, string> = {
        eurTzContract: "KT1PEBh9oKkQosYuw4tvzigps5p7uqXMgdez",
        fa12Contract: "KT1WsXMAzcre2MNUjNkGtVQLpsTnNFhBJhLv",
        nftContract: "KT1QZamFBrDPEPgWDGVt2NkviqexVVVAzLmq",
        mtContract: "KT1Uke8qc4YTfP41dGuoGC8UsgRyCtyvKPLA",
        nftContract1: "",
        mtContract1: "",
      }
      return convertTezostoUnionContractAddress(contracts[type])
    }
    case "testnet": {
      const contracts: Record<contractType, string> = {
        eurTzContract: "KT1PEBh9oKkQosYuw4tvzigps5p7uqXMgdez",
        fa12Contract: "KT1WsXMAzcre2MNUjNkGtVQLpsTnNFhBJhLv",
        nftContract: "KT1DtQV5qTnxdG49GbMRdKC8fg7bpvPLNcpm",
        mtContract: "KT1Uke8qc4YTfP41dGuoGC8UsgRyCtyvKPLA",
        nftContract1: "KT1EreNsT2gXRvuTUrpx6Ju4WMug5xcEpr43",
        mtContract1: "KT1RuoaCbnZpMgdRpSoLfJUzSkGz1ZSiaYwj",
      }
      return convertTezostoUnionContractAddress(contracts[type])
    }
    case "prod": {
      const contracts: Record<contractType, string> = {
        eurTzContract: "",
        fa12Contract: "KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW",
        nftContract: "",
        mtContract: "KT18pVpRXKPY2c4U2yFEGSH3ZnhB2kL8kwXS",
        nftContract1: "",
        mtContract1: "",
      }
      return convertTezostoUnionContractAddress(contracts[type])
    }
    default:
      throw new Error("Unrecognized env")
  }
}
