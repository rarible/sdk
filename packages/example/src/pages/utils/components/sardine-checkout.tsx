import React from "react"
import { WalletType } from "@rarible/sdk-wallet"
import { toItemId } from "@rarible/types"
import { Grid, Typography } from "@mui/material"
import type { ConnectionProvider } from "@rarible/connector/src"
import type { MattelConnectionProvider } from "@rarible/connector-mattel"
import type { MappedConnectionProvider } from "@rarible/connector"
import { useForm } from "react-hook-form"
import { FormTextInput } from "../../../components/common/form/form-text-input"
import { FormSubmit } from "../../../components/common/form/form-submit"
import { RequestResult } from "../../../components/common/request-result"
import { useSdk } from "../../../components/connector/sdk-connection-provider"
import { useRequestResult } from "../../../components/hooks/use-request-result"
import { useConnect } from "../../../connector/context"

export function SardineCheckout() {
	const { result, isFetching, setError, setComplete } = useRequestResult()
	const sdk = useSdk()
	const blockchain = sdk?.wallet?.walletType
	const isFlowActive = blockchain === WalletType.FLOW
	const form = useForm()
	const { handleSubmit } = form
	const connector = getConnectorFromContext()
	if (!isMattelProvider(connector)) {
		return <></>
	}
	return (
		<>

			<form onSubmit={handleSubmit(async () => {
				try {
					if (!sdk) {
						return
					}
					try {
						const accountInitStatus = await sdk.flow?.checkInitMattelCollections()
						console.log("accountInitStatus", accountInitStatus)
						if (!accountInitStatus?.initCollections) {
							const tx = await sdk.flow?.setupMattelCollections()
							await tx?.wait()
						}
					} catch (e) {
						console.log("err init status", e)
					}
					const orderId = form.getValues("orderId")
					const order = await sdk.apis.order.getOrderById({ id: orderId })
					if (order.make.type["@type"] !== "FLOW_NFT") {
						throw new Error("Is not a sell order")
					}
					const itemId = await sdk.apis.item.getItemById({
						itemId: toItemId(`${order.make.type.contract}:${order.make.type.tokenId}`),
					})
					const img = itemId.meta?.content.find(item => item["@type"] === "IMAGE")
					const result = await connector.sardinePurchase({
						orderId,
						orderMaker: order.maker,
						purchaseOptions: {
							nft: {
								name: "test nft",
								imageUrl: img ? img.url : "https://cdn.shopify.com/s/files/1/0568/1132/3597/files/HWNFT_S4_modular-grid_584x800b.jpg?v=1669157307",
							},
						},
					})
					setComplete(result)
				} catch (e) {
					setError(JSON.stringify(e, null, "  "))
				}
			})}>

				<Typography sx={{ my: 2 }} variant="h6" component="h2" gutterBottom>
          Buy Flow item by Sardine
				</Typography>
				<Grid container spacing={2}>

					<Grid item xs={4}>
						<FormTextInput
							type="text"
							form={form}
							name="orderId"
							label="Order Id"
							disabled={!isFlowActive}
						/>
					</Grid>
					<Grid item xs={2}>
						<FormSubmit
							form={form}
							label="Buy"
							state={isFetching ? "normal": "success"}
							disabled={isFetching || !isFlowActive}
						/>
					</Grid>
				</Grid>
			</form>

			<RequestResult
				result={result}
				completeRender={(data) =>
					<>
            result: {data.toString()}
					</>
				}
			/>
		</>
	)
}

function isMattelProvider(x: ConnectionProvider<any, any> | undefined): x is MattelConnectionProvider {
	return x?.getId() === "mattel"
}

function getConnectorFromContext() {
	const connection = useConnect()
	const currentProvider = connection.connector?.getCurrentProvider()

	if (currentProvider) {
		return (currentProvider as MappedConnectionProvider<any, any, any>).getProvider()
	}
	return undefined
}
