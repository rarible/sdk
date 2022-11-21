import React from "react"
import { Box, Container } from "@mui/material"
import { Route, Routes } from "react-router-dom"
import { AboutPage } from "./pages/about/about-page"
import { ConnectPage } from "./pages/connect/connect-page"
import { NotFoundPage } from "./pages/404/404-page"
import { Header } from "./components/parts/Header/header"
import { Navigation } from "./components/parts/navigation"
import { SdkConnectionProvider } from "./components/connector/sdk-connection-provider"
import { EnvironmentSelectorProvider } from "./components/connector/environment-selector-provider"
import { DeployPage } from "./pages/deploy/deploy-page"
import { SellPage } from "./pages/sell/sell-page"
import { BuyPage } from "./pages/buy/buy-page"
import { MintPage } from "./pages/mint/mint-page"
import { BidPage } from "./pages/bid/bid-page"
import { AcceptBidPage } from "./pages/accept-bid/acceptbid-page"
import { ItemsPage } from "./pages/items/items-page"
import { UploadMetaPage } from "./pages/upload-meta/upload-meta-page"
import { BurnPage } from "./pages/burn/burn-page"
import { TransferPage } from "./pages/transfer/transfer-page"
import { BalancePage } from "./pages/balance/balance-page"
import { CancelPage } from "./pages/cancel/cancel-page"
import { BatchBuyPage } from "./pages/batchBuy/batch-buy-page"
import { SignPage } from "./pages/sign/sign-page"

export function App() {
	return (
		<EnvironmentSelectorProvider>
			{(connector) => (
				<SdkConnectionProvider connector={connector}>
					<Box>
						<Header/>
						<Container maxWidth="xl" sx={{
							mt: 2,
							display: 'grid',
							gridTemplateColumns: 'minmax(250px, 20%)  1fr',
							gap: "20px"
						}}>
							<Box component="nav">
								<Navigation/>
							</Box>
							<Box component="main">
								<Routes>
									<Route path="/" element={<AboutPage/>}/>
									<Route path="about" element={<AboutPage/>}/>
									<Route path="connect" element={<ConnectPage/>}/>
									<Route path="balance" element={<BalancePage/>}/>
									<Route path="deploy" element={<DeployPage/>}/>
									<Route path="upload-meta" element={<UploadMetaPage/>}/>
									<Route path="mint" element={<MintPage/>}/>
									<Route path="sell" element={<SellPage/>}>
										<Route path=":itemId" element={<SellPage/>}/>
									</Route>
									<Route path="buy" element={<BuyPage/>}>
										<Route path=":orderId" element={<BuyPage/>}/>
									</Route>
									<Route path="batch-buy" element={<BatchBuyPage/>}/>
									<Route path="bid" element={<BidPage/>}>
										<Route path=":itemId" element={<BidPage/>}/>
									</Route>
									<Route path="accept-bid" element={<AcceptBidPage/>}>
										<Route path=":orderId" element={<AcceptBidPage/>}/>
									</Route>
									<Route path="cancel" element={<CancelPage/>}/>
									<Route path="transfer" element={<TransferPage/>}>
										<Route path=":itemId" element={<TransferPage/>}/>
									</Route>
									<Route path="burn" element={<BurnPage/>}>
										<Route path=":itemId" element={<BurnPage/>}/>
									</Route>
									<Route path="items" element={<ItemsPage/>}/>
									<Route path="sign" element={<SignPage/>}/>
									<Route path="*" element={<NotFoundPage/>}/>
								</Routes>
							</Box>
						</Container>
					</Box>
				</SdkConnectionProvider>
			)}
		</EnvironmentSelectorProvider>
	);
}
