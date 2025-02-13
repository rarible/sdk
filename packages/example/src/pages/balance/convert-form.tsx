import { useState } from "react"
import { useForm } from "react-hook-form"
import { Box, Grid, MenuItem } from "@mui/material"
import type { EthEthereumAssetType, EthErc20AssetType } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import type { RaribleSdkEnvironment } from "@rarible/sdk/build/config/domain"
import type { ContractAddress } from "@rarible/types"
import { toContractAddress } from "@rarible/types"
import type { WalletType } from "@rarible/sdk-wallet"
import type { IRaribleSdk } from "@rarible/sdk"
import type { UnionAddress } from "@rarible/types"
import type { SupportedBlockchain } from "@rarible/sdk-common"
import { devEthereumConfig } from "@rarible/protocol-ethereum-sdk/build/config/dev"
import { testnetEthereumConfig } from "@rarible/protocol-ethereum-sdk/build/config/testnet"
import { mainnetConfig } from "@rarible/protocol-ethereum-sdk/build/config/mainnet"
import { FormSubmit } from "../../components/common/form/form-submit"
import { FormSelect } from "../../components/common/form/form-select"
import { useRequestResult } from "../../components/hooks/use-request-result"
import { FormTextInput } from "../../components/common/form/form-text-input"
import { RequestResult } from "../../components/common/request-result"
import { TransactionInfo } from "../../components/common/transaction-info"
import { useSdkContext } from "../../components/connector/sdk"
import { useEnvironmentContext } from "../../components/connector/env"
import { useGetBalance } from "./hooks/use-get-balance"

export function ConvertForm({ sdk, walletAddress }: { sdk: IRaribleSdk; walletAddress: UnionAddress }) {
  const connection = useSdkContext()
  const { environment } = useEnvironmentContext()
  const form = useForm()
  const { handleSubmit } = form

  const blockchain =
    connection.state.status === "connected" ? connection.state.connection.blockchain : connection.sdk.wallet?.walletType
  const wethAddress = getWethAddress(blockchain, environment)

  const nativeToken = blockchain === "POLYGON" ? "POL" : "ETH"
  const convertOptions = [
    {
      label: `${nativeToken} -> WETH`,
      from: { "@type": "ETH", blockchain } as EthEthereumAssetType,
      to: { "@type": "ERC20", contract: wethAddress } as EthErc20AssetType,
    },
    {
      label: `WETH -> ${nativeToken}`,
      from: { "@type": "ERC20", contract: wethAddress } as EthErc20AssetType,
      to: { "@type": "ETH", blockchain } as EthEthereumAssetType,
    },
  ]

  const [convertSchema, setConvertSchema] = useState(convertOptions[0])

  const { data: balance, isLoading: isBalanceFetching } = useGetBalance(sdk, walletAddress, convertSchema.from)
  const { result, isFetching: isConvertFetching, setError, setComplete } = useRequestResult()

  return (
    <>
      <form
        onSubmit={handleSubmit(async () => {
          try {
            if (connection.state.status === "connected") {
              const res = await sdk?.balances.convert({
                blockchain: connection.state.connection.blockchain as SupportedBlockchain,
                value: form.getValues("value"),
                isWrap: convertSchema.from["@type"] === "ETH",
              })
              setComplete(res)
              await res.wait()
            }
          } catch (e: any) {
            setError(e)
          }
        })}
      >
        <Grid container spacing={2}>
          <Grid item xs={5}>
            <FormTextInput
              type="number"
              inputProps={{ min: 0, max: balance, step: "any" }}
              form={form}
              options={{
                min: 0,
                max: balance?.toString() || undefined,
              }}
              name="value"
              label="Value"
            />
          </Grid>
          <Grid item xs={4}>
            <FormSelect
              form={form}
              value={convertSchema.label}
              onChange={e => {
                const o = convertOptions.find(o => o.label === e.target.value)!
                setConvertSchema(o)
                // const selectedOption = getCurrencyOptionByValue(e.target.value, currencyOptions)
                // form.setValue("value", )
              }}
              name="currencyType"
              label="Currency"
            >
              {convertOptions.map((option, index) => {
                return (
                  <MenuItem key={index + "-value"} value={option.label}>
                    {option.label}
                  </MenuItem>
                )
              })}
            </FormSelect>
          </Grid>

          <Grid item xs={2}>
            <FormSubmit
              form={form}
              label="Convert"
              state={isBalanceFetching || isConvertFetching ? "normal" : "success"}
              disabled={isBalanceFetching || isConvertFetching}
            />
          </Grid>
        </Grid>
      </form>

      <Box sx={{ my: 2 }}>
        <RequestResult
          result={result}
          completeRender={data => (
            <Box sx={{ my: 2 }}>
              <TransactionInfo transaction={data} />
            </Box>
          )}
        />
      </Box>
    </>
  )
}

type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T
}

const wethMapByBlockchain: PartialRecord<Blockchain, PartialRecord<RaribleSdkEnvironment, ContractAddress>> = {
  [Blockchain.ETHEREUM]: {
    prod: toContractAddress(`ETHEREUM:${mainnetConfig.weth}`),
    testnet: toContractAddress(`ETHEREUM:${testnetEthereumConfig.weth}`),
    development: toContractAddress(`ETHEREUM:${devEthereumConfig.weth}`),
  },
  // [Blockchain.POLYGON]: {
  // 	prod: toContractAddress("ETHEREUM:0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"),
  // 	testnet: toContractAddress("POLYGON:0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa"),
  // 	staging: toContractAddress("POLYGON:0x85de069e16a42880c57b0D6451D6C770EC1D3Bf7"),
  // 	development: toContractAddress("POLYGON:0xb24740adECB71fEb7d66AA4EBD5F5c334E5bE922")
  // }
}

export function isAvailableWethConvert(blockchain?: WalletType | Blockchain, env?: RaribleSdkEnvironment): boolean {
  return !!getWethAddress(blockchain, env)
}

export function getWethAddress(
  blockchain?: WalletType | Blockchain,
  env?: RaribleSdkEnvironment,
): ContractAddress | undefined {
  if (!blockchain || !env || !wethMapByBlockchain || !wethMapByBlockchain[blockchain]) {
    return undefined
  }
  const blockchainObj = wethMapByBlockchain[blockchain]
  return blockchainObj && blockchainObj[env]
}
