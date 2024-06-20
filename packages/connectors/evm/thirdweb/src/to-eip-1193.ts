import { ProviderDisconnectedError, MethodNotFoundRpcError, InvalidParamsRpcError } from "viem"
import type {
  EIP1193Provider,
  RpcTransactionRequest,
  EIP1193Parameters,
  EIP1474Methods,
  EIP1193EventMap,
  TransactionSerializable,
  RpcError,
} from "viem"
import { BigNumber } from "bignumber.js"
import type { Wallet, WalletConnectionOption, WalletId } from "thirdweb/wallets"
import { TypedEmitter } from "tiny-typed-emitter"
import type { Chain, ThirdwebClient } from "thirdweb"
import type { SendTransactionOption } from "thirdweb/dist/types/wallets/interfaces/wallet"
import type { Hex } from "thirdweb/dist/types/utils/encoding/hex"
import { first, map, switchMap } from "rxjs/operators"
import type { ThirdwebChainOrChainId, ThirdwebWalletOptionsExtra } from "./domain"
import { getSavedAccounts, setSavedAccounts, thirdwebChains$, thirdwebRpc$ } from "./utils"

export class EIP1193ProviderAdapter<Id extends WalletId>
  extends TypedEmitter<EIP1193EventMap>
  implements EIP1193Provider
{
  constructor(
    private readonly defaultChain: ThirdwebChainOrChainId | undefined,
    public readonly client: ThirdwebClient,
    public readonly wallet: Wallet<Id>,
    public readonly defaultOptions: ThirdwebWalletOptionsExtra<Id>,
  ) {
    super()

    wallet.subscribe("accountsChanged", accounts => {
      this.emit("accountsChanged", accounts)
    })

    wallet.subscribe("chainChanged", chain => {
      try {
        this.emit("chainChanged", toHexadecimal(chain.id))
      } catch (error) {
        // We can expect here error in case:
        // 1. If thirdweb's provider returns unparsable chain id
        console.warn("EIP1193: chainChanged is not fired, see error below:")
        console.error(error)
      }
    })

    wallet.subscribe("disconnect", () => {
      this.emit("disconnect", new ProviderDisconnectedError(new Error("Provider is disconnected from all chains")))
    })

    wallet.subscribe("onConnect", () => {
      try {
        const chain = this._getChain()
        this.emit("connect", {
          chainId: toHexadecimal(chain.id),
        })
      } catch (error) {
        // We can expect here error in case:
        // 1. If thirdweb's provider is disconnected when 'onConnect' fired
        console.warn("EIP1193: onConnect is not fired, see error below:")
        console.error(error)
      }
    })
  }

  enable = () => this.request({ method: "eth_requestAccounts" })

  request = (async (data: EIP1193Parameters<EIP1474Methods>) => {
    try {
      const res = await this._request(data)
      if (isJsonRpcResult(res)) {
        return res.result
      }
      return res
    } catch (error) {
      if (isJsonRpcError(error)) {
        throw error.error
      }
      throw error
    }
  }) as EIP1193Provider["request"]

  private _request = async (data: EIP1193Parameters<EIP1474Methods>) => {
    switch (data.method) {
      case "eth_chainId": {
        const chain = this._getChain()
        return toHexadecimal(chain.id)
      }

      case "eth_signTransaction": {
        const account = this._getAccount()
        if (!account.signTransaction) {
          throw new MethodNotFoundRpcError(new Error("'eth_signTransaction' is not supported by this wallet"))
        }
        const chain = this._getChain()
        const options = prepareTransaction(chain, data.params[0])
        return account.signTransaction(options)
      }

      case "eth_accounts": {
        return getSavedAccounts()
      }

      case "eth_sendTransaction": {
        const account = this._getAccount()
        const chain = this._getChain()
        const options = prepareTransaction(chain, data.params[0])
        if (!options.gas) {
          // Gas estimation is required here
          options.gas = await this.request({
            method: "eth_estimateGas",
            params: data.params,
          })
        }
        if (!options.nonce) {
          // nonce is also required
          options.nonce = await this.request({
            method: "eth_getTransactionCount",
            params: [account.address, "pending"],
          })
        }
        const { transactionHash } = await account.sendTransaction(options)
        return transactionHash
      }

      case "personal_sign": {
        const account = this._getAccount()
        return account.signMessage({
          message: {
            raw: data.params[0],
          },
        })
      }

      case "wallet_switchEthereumChain": {
        const chainId = parseChainId(data.params[0].chainId)
        const chain = await this._defineChain(chainId)
        return this.wallet.switchChain(chain)
      }

      case "eth_signTypedData_v4": {
        const account = this._getAccount()
        const message = data.params[1]
        return account.signTypedData(JSON.parse(message))
      }

      case "eth_requestAccounts": {
        const chain = await this._getDefaultChain()
        const account = await this.wallet.connect({
          client: this.client,
          chain,
          ...this.defaultOptions,
        } as WalletConnectionOption<Id>)

        setSavedAccounts([account.address])

        return [account.address]
      }

      // Handle other requests by rpc public client
      default: {
        return await thirdwebRpc$
          .pipe(
            map(x =>
              x.getRpcClient({
                chain: this._getChain(),
                client: this.client,
              }),
            ),
            switchMap(request => request(data)),
            first(),
          )
          .toPromise()
      }
    }
  }

  private async _getDefaultChain() {
    if (this.defaultChain) {
      if ("chain" in this.defaultChain) {
        return this.defaultChain.chain
      }
      return this._defineChain(this.defaultChain.chainId)
    }
    return undefined
  }

  private async _defineChain(chainId: number) {
    const chains = await thirdwebChains$.pipe(first()).toPromise()
    return chains.defineChain({
      id: chainId,
    })
  }

  private _getAccount() {
    const authorized = this.wallet.getAccount()
    if (!authorized) {
      throw new ProviderDisconnectedError(new Error("Provider is not connected, request `eth_requestAccounts` first"))
    }
    return authorized
  }

  private _getChain() {
    const chain = this.wallet.getChain()
    if (!chain) {
      throw new ProviderDisconnectedError(new Error("Provider is not connected, request `eth_requestAccounts` first"))
    }
    return chain
  }
}

function prepareTransaction(chain: Chain, request: RpcTransactionRequest): SendTransactionOption {
  return {
    chainId: chain.id,
    ...(request as TransactionSerializable),
  }
}

type BnValue = string | number

function parseBn(value: BnValue) {
  const parsed = new BigNumber(value)
  if (parsed.isNaN()) {
    throw new InvalidParamsRpcError(new Error("Value must be valid number or string representing number"))
  }
  return parsed
}

function toHexadecimal(value: BnValue): Hex {
  return `0x${parseBn(value).toString(16)}`
}

function parseChainId(chainId: string) {
  return parseBn(chainId).toNumber()
}

type JsonRpcResponse = {
  id: string
  jsonrpc: "2.0"
}

function isJsonRpcResponse(x: unknown): x is JsonRpcResponse {
  return typeof x === "object" && x !== null && "id" in x && "jsonrpc" in x
}

type JsonRpcError = {
  id: string
  jsonrpc: "2.0"
  error: RpcError
}

function isJsonRpcError(x: unknown): x is JsonRpcError {
  return isJsonRpcResponse(x) && "error" in x
}

type JsonRpcResult = {
  id: string
  jsonrpc: "2.0"
  result: unknown
}

function isJsonRpcResult(x: unknown): x is JsonRpcResult {
  return isJsonRpcResponse(x) && "result" in x
}
