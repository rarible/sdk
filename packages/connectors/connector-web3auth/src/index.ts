import type { Observable } from "rxjs"
import { first, mergeMap, startWith } from "rxjs/operators"
import { WALLET_ADAPTERS } from "@web3auth/base"
import type {
	ConnectionState,
	EthereumProviderConnectionResult,
	Maybe,
} from "@rarible/connector"
import {
	AbstractConnectionProvider,
	cache,
	connectToWeb3,
	getStateConnecting,
} from "@rarible/connector"
import { Web3AuthNoModal } from "@web3auth/no-modal"
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider"
import { OpenloginAdapter } from "@web3auth/openlogin-adapter"
import type { ChainNamespaceType } from "@web3auth/base"
import type { UserCredential } from "@firebase/auth"
import {
	GoogleAuthProvider,
	getAuth,
	signInWithPopup,
	getIdToken,
} from "@firebase/auth"

const PROVIDER_ID = "web3auth" as const

export class Web3AuthConnectionProvider extends AbstractConnectionProvider<
  typeof PROVIDER_ID,
EthereumProviderConnectionResult
> {
  private readonly instance: Observable<Web3AuthNoModal>;
  private readonly connection: Observable<
  ConnectionState<EthereumProviderConnectionResult>
  >;

  constructor() {
  	super()
  	this.instance = cache(() => this._connect())
  	this.connection = this.instance.pipe(
  		mergeMap((instance) => {
  			return connectToWeb3(instance.provider, {
  				disconnect: this.disconnect.bind(this),
  			})
  		}),
  		startWith(getStateConnecting({ providerId: PROVIDER_ID }))
  	)
  }

  private async _connect(): Promise<Web3AuthNoModal> {
  	const chainConfig = {
  		chainNamespace: "eip155" as ChainNamespaceType,
  		chainId: "0x89",
  		rpcTarget: "https://rpc.ankr.com/eth",
  		displayName: "Polygon Mainnet",
  		blockExplorer: "https://polygonscan.com",
  		ticker: "MATIC",
  		tickerName: "Polygon",
  	}

  	const web3auth = new Web3AuthNoModal({
  		clientId:
        "BBD0kzmxWBstkgHeJsQqwiF7RbVgmA7ReBRIyw2GRJoCHJTuCAXHD8pwX3PtotSwwh0EMoBZVgVjRss6jKq8Kg8",
  		web3AuthNetwork: "testnet",
  		chainConfig,
  	})

  	const privateKeyProvider = new EthereumPrivateKeyProvider({
  		config: { chainConfig },
  	})

  	const openloginAdapter = new OpenloginAdapter({
  		adapterSettings: {
  			uxMode: "popup", // or "redirect"
  			loginConfig: {
  				jwt: {
  					verifier: "firebase-dog-dev",
  					typeOfLogin: "jwt",
  					clientId:
              "BBD0kzmxWBstkgHeJsQqwiF7RbVgmA7ReBRIyw2GRJoCHJTuCAXHD8pwX3PtotSwwh0EMoBZVgVjRss6jKq8Kg8",
  				},
  			},
  		},
  		privateKeyProvider,
  	})

  	web3auth.configureAdapter(openloginAdapter)

  	await web3auth.init()

  	// Firebase authentication integration
  	try {
  		const auth = getAuth()
  		const provider = new GoogleAuthProvider()
  		const userCredential: UserCredential = await signInWithPopup(
  			auth,
  			provider
  		)
  		const idToken = await getIdToken(userCredential.user)
  		console.log("Firebase ID token", idToken)

  		const web3authProvider = await web3auth.connectTo(
  			WALLET_ADAPTERS.OPENLOGIN,
  			{
  				loginProvider: "jwt",
  				mfaLevel: "none",
  				extraLoginOptions: {
  					id_token: idToken,
  					verifierIdField: "sub",
  					domain: "http://localhost:3000",
  				},
  			}
  		)

  		// @ts-ignore
  		const address = (await web3authProvider.request({
  			method: "eth_accounts",
  		})) as Array<string>
  		console.log("User wallet address", address)
  		return web3auth
  	} catch (error) {
  		console.error("Error signing in with Firebase", error)
  		throw error // Handle the error appropriately in your application
  	}
  }

  getId(): string {
  	return PROVIDER_ID
  }

  getConnection(): Observable<
  ConnectionState<EthereumProviderConnectionResult>
  > {
  	return this.connection
  }

  getOption(): Promise<Maybe<typeof PROVIDER_ID>> {
  	return Promise.resolve(PROVIDER_ID)
  }

  async isAutoConnected(): Promise<boolean> {
  	return false
  }

  async isConnected(): Promise<boolean> {
  	const sdk = await this.instance.pipe(first()).toPromise()
  	return sdk ? sdk.connected : false
  }

  private async getIdFBToken(): Promise<string | null> {
  	const auth = getAuth()
  	if (auth.currentUser) {
  		const userIdToken = await getIdToken(auth.currentUser)
  		return userIdToken
  	}
  	return null
  }

  private async disconnect(): Promise<void> {
  	const sdk = await this.instance.pipe(first()).toPromise()
  	if (sdk) {
  		await sdk.logout({ cleanup: true })
  	}
  }
}
