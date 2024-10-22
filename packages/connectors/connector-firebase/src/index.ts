import type { Observable } from "rxjs"
import { first, mergeMap, startWith } from "rxjs/operators"
import { WALLET_ADAPTERS } from "@web3auth/base"
import type { ConnectionState, EthereumProviderConnectionResult, Maybe } from "@rarible/connector"
import { AbstractConnectionProvider, cache, connectToWeb3, getStateConnecting } from "@rarible/connector"
import { Web3AuthNoModal } from "@web3auth/no-modal"
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider"
import type { OPENLOGIN_NETWORK_TYPE } from "@web3auth/openlogin-adapter"
import { OpenloginAdapter } from "@web3auth/openlogin-adapter"
import type { ChainNamespaceType } from "@web3auth/base"
import type { UserCredential } from "@firebase/auth"
import { signOut } from "@firebase/auth"
import { GoogleAuthProvider, getAuth, signInWithPopup } from "@firebase/auth"
import { initializeApp } from "@firebase/app"

const PROVIDER_ID = "firebase" as const

export class FirebaseConnectionProvider extends AbstractConnectionProvider<
  typeof PROVIDER_ID,
  EthereumProviderConnectionResult
> {
  private readonly instance: Observable<Web3AuthNoModal>
  private readonly connection: Observable<ConnectionState<EthereumProviderConnectionResult>>

  constructor(
    private readonly clientId: string,
    private readonly chainConfig: {
      chainNamespace: ChainNamespaceType
      chainId: string
      rpcTarget: string
      displayName: string
      blockExplorer: string
      ticker: string
      tickerName: string
    },
    private readonly firebaseConfig: {
      apiKey: string
      authDomain: string
      projectId: string
      storageBucket: string
      messagingSenderId: string
      appId: string
    },
    private readonly network: OPENLOGIN_NETWORK_TYPE | undefined,
    private readonly openLoginDomain: string,
    private readonly jwtVerifier: string,
  ) {
    super()
    this.instance = cache(() => this._connect())
    this.connection = this.instance.pipe(
      mergeMap(instance => {
        return connectToWeb3(instance.provider, {
          disconnect: () => this.disconnect(instance),
        })
      }),
      startWith(getStateConnecting({ providerId: PROVIDER_ID })),
    )
  }

  private async _connect(): Promise<Web3AuthNoModal> {
    const web3auth = new Web3AuthNoModal({
      clientId: this.clientId,
      web3AuthNetwork: this.network,
      chainConfig: this.chainConfig,
      useCoreKitKey: false,
    })

    const privateKeyProvider = new EthereumPrivateKeyProvider({
      config: { chainConfig: this.chainConfig },
    })

    const openloginAdapter = new OpenloginAdapter({
      adapterSettings: {
        uxMode: "popup",
        loginConfig: {
          jwt: {
            verifier: this.jwtVerifier,
            typeOfLogin: "jwt",
            clientId: this.clientId,
          },
        },
      },
      privateKeyProvider,
    })

    web3auth.configureAdapter(openloginAdapter)

    await web3auth.init()
    if (web3auth.connected) return web3auth
    const app = initializeApp(this.firebaseConfig)
    const auth = getAuth(app)
    const provider = new GoogleAuthProvider()
    const userCredential: UserCredential = await signInWithPopup(auth, provider)
    try {
      const idToken = await userCredential.user.getIdToken(true)
      await web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
        loginProvider: "jwt",
        mfaLevel: "none",
        extraLoginOptions: {
          id_token: idToken,
          verifierIdField: "sub",
          domain: this.openLoginDomain,
        },
      })
      return web3auth
    } catch (error) {
      console.error("Error signing in with Firebase", error)
      if (app && auth) {
        await signOut(auth)
      }

      if (web3auth) {
        web3auth.logout({ cleanup: true })
      }
      throw error
    }
  }

  getId(): string {
    return PROVIDER_ID
  }

  getConnection(): Observable<ConnectionState<EthereumProviderConnectionResult>> {
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

  private async disconnect(instance: Web3AuthNoModal): Promise<void> {
    const app = initializeApp(this.firebaseConfig)
    const auth = getAuth(app)
    if (app && auth) {
      await signOut(auth)
    }

    if (instance) {
      instance.logout({ cleanup: true })
    }
  }
}
