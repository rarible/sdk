import { NetworkType as TezosNetwork } from "@airgap/beacon-sdk"
import type { RaribleSdkEnvironment } from "@rarible/sdk/build/config/domain"
import type { ConnectionProvider, IConnectorStateProvider } from "@rarible/connector"
import { Connector, DappType, InjectedWeb3ConnectionProvider } from "@rarible/connector"
import { FclConnectionProvider } from "@rarible/connector-fcl"
import { NFIDConnectionProvider } from "@rarible/connector-nfid"
import { BeaconConnectionProvider } from "@rarible/connector-beacon"
import { TorusConnectionProvider } from "@rarible/connector-torus"
import { FirebaseConnectionProvider } from "@rarible/connector-firebase"
import { FirebaseAppleConnectionProvider } from "@rarible/connector-firebase-apple"
import { FirebaseEmailConnectionProvider } from "@rarible/connector-firebase-email"
import { WalletLinkConnectionProvider } from "@rarible/connector-walletlink"
import { PhantomConnectionProvider } from "@rarible/connector-phantom"
import { SolflareConnectionProvider } from "@rarible/connector-solflare"
import { SalmonConnectionProvider } from "@rarible/connector-salmon"
import type { IWalletAndAddress } from "@rarible/connector-helper"
import { mapEthereumWallet, mapFlowWallet, mapImmutableXWallet, mapSolanaWallet, mapTezosWallet } from "@rarible/connector-helper"
import { ImmutableXLinkConnectionProvider } from "@rarible/connector-immutablex-link"
import { MattelConnectionProvider } from "@rarible/connector-mattel"
import { WalletConnectConnectionProviderV2 } from "@rarible/connector-walletconnect-v2"
import type { ImxEnv } from "@rarible/immutable-wallet"

export const ethereumRpcMap: Record<number, string> = {
	1: "https://rarible.com/nodes/ethereum-node",
	11155111: "https://testnet.rarible.com/nodes/sepolia-ethereum-node",
}

const ethereumNetworkMap: Record<number, string> = {
	1: "mainnet",
	5: "goerli",
	11155111: "sepolia",
}

const environmentToEthereumChainId: Record<RaribleSdkEnvironment, number> = {
	prod: 1,
	testnet: 11155111,
	development: 300500,
}

function environmentToFlowNetwork(environment: RaribleSdkEnvironment) {
	switch (environment) {
		case "prod":
			return {
				network: "mainnet",
				accessNode: "https://access.onflow.org",
				walletDiscovery: "https://flow-wallet.blocto.app/authn",
			}
		case "testnet":
		default:
			return {
				network: "testnet",
				accessNode: "https://access-testnet.onflow.org",
				walletDiscovery: "https://flow-wallet-testnet.blocto.app/authn",
			}
	}
}

function environmentToTezosNetwork(environment: RaribleSdkEnvironment) {
	switch (environment) {
		case "prod":
			return {
				accessNode: "https://rpc.tzkt.io/mainnet",
				network: TezosNetwork.MAINNET,
			}
		case "development":
			return {
				accessNode: "https://rpc.tzkt.io/ghostnet",
				network: TezosNetwork.CUSTOM,
			}
		case "testnet":
		default:
			return {
				accessNode: "https://rpc.tzkt.io/ghostnet",
				network: TezosNetwork.CUSTOM,
			}
	}
}


const environmentToImmutableXNetwork: Record<RaribleSdkEnvironment, ImxEnv> = {
	prod: "prod",
	testnet: "testnet",
	development: "testnet"
}

const LOCALSTORAGE_STATE_KEY = "saved_provider"
const state: IConnectorStateProvider = {
	async getValue(): Promise<string | undefined> {
		return localStorage.getItem(LOCALSTORAGE_STATE_KEY) || undefined
	},
	async setValue(value: string | undefined): Promise<void> {
		if (value) return localStorage.setItem(LOCALSTORAGE_STATE_KEY, value)
		return localStorage.removeItem(LOCALSTORAGE_STATE_KEY)
	},
}

export function getConnector(environment: RaribleSdkEnvironment) {
	const ethChainId = environmentToEthereumChainId[environment]
	const flowNetwork = environmentToFlowNetwork(environment)
	const tezosNetwork = environmentToTezosNetwork(environment)

	const injected = mapEthereumWallet(
		new InjectedWeb3ConnectionProvider({
			prefer: [DappType.Metamask],
		})
	)

	const nfid = mapEthereumWallet(
		new NFIDConnectionProvider({
			origin: process.env.REACT_APP_NFID_ORIGIN || "https://nfid.one",
		})
	)

	const beacon: ConnectionProvider<"beacon", IWalletAndAddress> = mapTezosWallet(
		new BeaconConnectionProvider({
			appName: "Rarible Test",
			accessNode: tezosNetwork.accessNode,
			network: tezosNetwork.network,
		})
	)

	const fcl = mapFlowWallet(
		new FclConnectionProvider({
			accessNode: flowNetwork.accessNode,
			walletDiscovery: flowNetwork.walletDiscovery,
			network: flowNetwork.network,
			applicationTitle: "Rari Test",
			applicationIcon: "https://rarible.com/favicon.png?2d8af2455958e7f0c812",
		})
	)

	const magic = mapFlowWallet(
		new MattelConnectionProvider({
			magicProviderId: "JeTIUJ7GJNnfwnxMwtPRa7JzbzRVxA4p3TdQsXryggM=",
			magicAPIKey: "pk_live_63A5A557D1D4882D",
			auth0Domain: "login-test.mattel.com",
			auth0ClientId: "nXpDI0BnWhxB5DIhQVGOrB2LwgOvKIhd",
			auth0RedirectUrl: "https://test-virtual.mattel.com",
			accessNode: flowNetwork.accessNode,
			network: flowNetwork.network,
			options: {
				auth0LogoutOptions: {
					logoutParams: {
						returnTo: "https://test-virtual.mattel.com",
					},
				},
			},
		})
	)

	const torus = mapEthereumWallet(
		new TorusConnectionProvider({
			network: {
				host: ethereumNetworkMap[ethChainId],
			},
		})
	)

	const firebase = mapEthereumWallet(
		new FirebaseConnectionProvider(
			"BBD0kzmxWBstkgHeJsQqwiF7RbVgmA7ReBRIyw2GRJoCHJTuCAXHD8pwX3PtotSwwh0EMoBZVgVjRss6jKq8Kg8",
			{
				chainNamespace: "eip155",
				chainId: "0x13881",
				rpcTarget: "https://rpc.ankr.com/polygon_mumbai",
				displayName: "Polygon Mumbai Testnet",
				blockExplorer: "https://mumbai.polygonscan.com/",
				ticker: "MATIC",
				tickerName: "Matic",
			},
			{
				apiKey: "AIzaSyD7h1O-nf40cRyLpP9F_Wl1Z_zuZYyZh5Y",
				authDomain: "dogami-auth.firebaseapp.com",
				projectId: "dogami-auth",
				storageBucket: "dogami-auth.appspot.com",
				messagingSenderId: "741349520212",
				appId: "1:741349520212:web:8acb236f44ddd005adcec1",
			},
			"testnet",
			"http://localhost:3000",
			"firebase-dog-dev"
		)
	)

	const firebaseApple = mapEthereumWallet(
		new FirebaseAppleConnectionProvider(
			"BBD0kzmxWBstkgHeJsQqwiF7RbVgmA7ReBRIyw2GRJoCHJTuCAXHD8pwX3PtotSwwh0EMoBZVgVjRss6jKq8Kg8",
			{
				chainNamespace: "eip155",
				chainId: "0x13881",
				rpcTarget: "https://rpc.ankr.com/polygon_mumbai",
				displayName: "Polygon Mumbai Testnet",
				blockExplorer: "https://mumbai.polygonscan.com/",
				ticker: "MATIC",
				tickerName: "Matic",
			},
			{
				apiKey: "AIzaSyD7h1O-nf40cRyLpP9F_Wl1Z_zuZYyZh5Y",
				authDomain: "dogami-auth.firebaseapp.com",
				projectId: "dogami-auth",
				storageBucket: "dogami-auth.appspot.com",
				messagingSenderId: "741349520212",
				appId: "1:741349520212:web:8acb236f44ddd005adcec1",
			},
			"testnet",
			"http://localhost:3000",
			"firebase-dog-dev"
		)
	)

	const firebaseEmail = mapEthereumWallet(
		new FirebaseEmailConnectionProvider(
			"BBD0kzmxWBstkgHeJsQqwiF7RbVgmA7ReBRIyw2GRJoCHJTuCAXHD8pwX3PtotSwwh0EMoBZVgVjRss6jKq8Kg8",
			{
				chainNamespace: "eip155",
				chainId: "0x13881",
				rpcTarget: "https://rpc.ankr.com/polygon_mumbai",
				displayName: "Polygon Mumbai Testnet",
				blockExplorer: "https://mumbai.polygonscan.com/",
				ticker: "MATIC",
				tickerName: "Matic",
			},
			{
				apiKey: "AIzaSyD7h1O-nf40cRyLpP9F_Wl1Z_zuZYyZh5Y",
				authDomain: "dogami-auth.firebaseapp.com",
				projectId: "dogami-auth",
				storageBucket: "dogami-auth.appspot.com",
				messagingSenderId: "741349520212",
				appId: "1:741349520212:web:8acb236f44ddd005adcec1",
			},
			"testnet",
			"http://localhost:3000",
			"firebase-dog-dev"
		)
	)

	const walletLink = mapEthereumWallet(
		new WalletLinkConnectionProvider(
			{
				networkId: ethChainId,
				estimationUrl: ethereumRpcMap[ethChainId],
				url: ethereumRpcMap[ethChainId],
			},
			{
				appName: "Rarible",
				appLogoUrl: "https://rarible.com/static/logo-500.static.png",
				darkMode: false,
			}
		)
	)

	const walletConnectV2 = mapEthereumWallet(
		new WalletConnectConnectionProviderV2({
			projectId: "4f9fb88799dfa8d3654bdd130be840f2",
			chains: [ethChainId],
			optionalChains: Object.keys(ethereumRpcMap)
				.map((x) => +x)
				.filter((x) => x !== ethChainId),
			showQrModal: true,
			methods: ["eth_sendTransaction", "personal_sign", "eth_signTypedData"],
			optionalMethods: [
				"eth_accounts",
				"eth_requestAccounts",
				"eth_sendRawTransaction",
				"eth_sign",
				"eth_signTransaction",
				"eth_signTypedData",
				"eth_signTypedData_v3",
				"eth_signTypedData_v4",
				"wallet_switchEthereumChain",
				"wallet_addEthereumChain",
				"wallet_getPermissions",
				"wallet_requestPermissions",
				"wallet_registerOnboarding",
				"wallet_watchAsset",
				"wallet_scanQRCode",
			],
			events: ["chainChanged", "accountsChanged"],
			optionalEvents: ["message", "disconnect", "connect"],
			rpcMap: ethereumRpcMap,
		})
	)

	const phantomConnect = mapSolanaWallet(new PhantomConnectionProvider())
	const salmonConnect = mapSolanaWallet(new SalmonConnectionProvider())
	const solflareConnect = mapSolanaWallet(
		new SolflareConnectionProvider({
			network: environment === "prod" ? "mainnet-beta" : "devnet",
		})
	)


	const imxConnector = mapImmutableXWallet(
		new ImmutableXLinkConnectionProvider({
			env: environmentToImmutableXNetwork[environment],
		})
	)

	return Connector.create(injected, state)
		.add(nfid)
		.add(walletLink)
		.add(beacon)
		.add(fcl)
		.add(walletConnectV2)
		.add(salmonConnect)
		.add(phantomConnect)
		.add(solflareConnect)
		.add(imxConnector)
		.add(magic)
		.add(firebaseApple)
		.add(torus)
		.add(firebase)
		.add(firebaseEmail)
}

export type ConnectorInstance = ReturnType<typeof getConnector>
