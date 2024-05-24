import React, { useState } from "react"
import { Box, Button, Grid, TextField, Typography } from "@mui/material"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { createRaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import { useRequestResult } from "../../../components/hooks/use-request-result"
import { RequestResult } from "../../../components/common/request-result"
import { ethereumRpcMap } from "../../../components/connector/connectors-setup"

export function TransactionData() {
  const [chainId, setChainId] = useState(undefined as undefined | number)
  const [address, setAddress] = useState("")
  const [orderId, setOrderId] = useState("")
  const { result, isFetching, setError, startFetching, setComplete } = useRequestResult()

  async function getTransactionData() {
    try {
      if (!chainId || !address) {
        throw new Error("Address or chain id has not been set")
      }
      startFetching()
      const sdk = getRaribleSdk(address.split(":")[1], chainId)

      let request: any = {}
      request.order = await sdk.apis.order.getValidatedOrderByHash({
        hash: orderId.split(":")[1],
      })
      const data = await sdk.order.getFillTxData(request)
      console.log("data", data)
      setComplete(JSON.stringify(data, null, "  "))
    } catch (e) {
      setError(e)
    }
  }

  return (
    <div>
      <Typography sx={{ my: 2 }} variant="subtitle1" gutterBottom>
        Enter Order ID, Chain ID and wallet address to get transaction data
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={2}>
          <TextField fullWidth={true} label="Order ID" value={orderId} onChange={e => setOrderId(e.target.value)} />
        </Grid>

        <Grid item xs={2}>
          <TextField fullWidth={true} label="From" value={address} onChange={e => setAddress(e.target.value)} />
        </Grid>

        <Grid item xs={1}>
          <TextField fullWidth={true} label="Chain ID" value={chainId} onChange={e => setChainId(+e.target.value)} />
        </Grid>

        <Grid style={{ display: "flex", alignItems: "center" }} item xs={7}>
          <Button variant="outlined" onClick={() => getTransactionData()} disabled={isFetching}>
            {isFetching ? "Loading..." : "Get transaction data"}
          </Button>
        </Grid>

        <Grid item xs={12}>
          <div style={{ wordBreak: "break-all" }}>
            <RequestResult
              result={result}
              completeRender={data => (
                <>
                  <Box sx={{ my: 2 }}>
                    <pre>{data}</pre>
                  </Box>
                </>
              )}
            />
          </div>
        </Grid>
      </Grid>
    </div>
  )
}

function getRaribleSdk(from: string, chainId: number) {
  const rpcUrl = ethereumRpcMap[chainId]
  if (!rpcUrl) throw new Error(`Rpc URL does not exist for current chainID=${chainId}`)

  const web3Provider = new Web3(new Web3.providers.HttpProvider(rpcUrl))
  const web3Ethereum = new Web3Ethereum({ web3: web3Provider, from })
  const ethEnv = getEVMEnvironmentByChainId(chainId)
  return createRaribleSdk(web3Ethereum, ethEnv, {
    apiKey: getEthApiKey(ethEnv),
  })
}

function getEVMEnvironmentByChainId(chainId: number): EthereumNetwork {
  switch (chainId) {
    case 1:
      return "mainnet"
    case 5:
      return "testnet"
    default:
      throw new Error("Please, set network for this chainID")
  }
}

function getEthApiKey(env: EthereumNetwork) {
  if (env === "mainnet") return process.env.REACT_APP_PROD_API_KEY
  return process.env.REACT_APP_TESTNETS_API_KEY ?? undefined
}
