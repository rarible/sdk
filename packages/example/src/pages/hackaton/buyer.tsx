import React, { useContext, useMemo } from "react"
import { WalletType } from "@rarible/sdk-wallet"
import { Page } from "../../components/page"
import { ConnectorContext } from "../../components/connector/sdk-connection-provider"
import { createEthSdk, GetLotteryDataBlock } from "./common"

export function BuyerPage() {
	const connection = useContext(ConnectorContext)
	// const [auctionContract, setAuctionContract] = useState(null as null | EthereumContract)
	// const isEth = connection.sdk?.wallet?.walletType === WalletType.ETHEREUM
	// function initContract() {
	// 	if (connection.sdk?.wallet?.walletType === WalletType.ETHEREUM) {
	// 		//abi/address
	// 		setAuctionContract(getContract(connection.sdk?.wallet.ethereum))
	// 	}
	// }

	const sdk = useMemo(() => {
		if (connection.sdk?.wallet?.walletType === WalletType.ETHEREUM) {
			//abi/address
			return createEthSdk(connection.sdk?.wallet.ethereum, "dev-ethereum")
		}
	}, [connection.sdk?.wallet])

	console.log("sdk", sdk)
	return (
		<Page header="Seller interface">

			<GetLotteryDataBlock isBuyTicketsEnabled={true} />
		</Page>
	)
}
