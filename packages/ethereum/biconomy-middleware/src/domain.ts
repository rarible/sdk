import type { TypedMessage as EthSigUtilTypedData } from "eth-sig-util"

export enum SignTypedDataMethodEnum {
  V4 = "eth_signTypedData_v4",
  V3 = "eth_signTypedData_v3",
  DEFAULT = "eth_signTypedData",
}

export type MessageTypeProperty = {
  name: string
  type: string
}

export type MessageTypes = {
  EIP712Domain: MessageTypeProperty[]
  [additionalProperties: string]: MessageTypeProperty[]
}

export type TypedMessage<T extends MessageTypes> = EthSigUtilTypedData<T>

export enum NetworkErrorCode {
  BICONOMY_EXTERNAL_ERR = "BICONOMY_EXTERNAL_ERR",
}
