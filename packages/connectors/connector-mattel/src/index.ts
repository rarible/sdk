import type { Observable } from "rxjs"
import type { ConnectionState, Maybe } from "@rarible/connector"
import {
	AbstractConnectionProvider,
	cache,
	getStateConnected,
	getStateConnecting,
	getStateDisconnected,
} from "@rarible/connector"
import type { Fcl } from "@rarible/fcl-types"
import { defer } from "rxjs"
import { first, map, mergeMap, startWith } from "rxjs/operators"
import type { ProviderConnectionResult } from "@rarible/connector"
import type { InstanceWithExtensions, SDKBase } from "@magic-sdk/provider"
import type { MagicUserMetadata } from "@magic-sdk/types"
import type { FlowExtension } from "@magic-ext/flow"
import type { OpenIdExtension } from "@magic-ext/oidc"
import type { Auth0Client } from "@auth0/auth0-spa-js"
import type { Auth0ClientOptions, PopupConfigOptions, LogoutOptions } from "@auth0/auth0-spa-js/dist/typings/global"

export type MattelConnectorConfig = {
	accessNode: string
	network: string
	magicAPIKey: string
	magicProviderId: string
	auth0Domain: string
	auth0ClientId: string
	auth0RedirectUrl: string
	options?: {
		auth0ClientOptions?: Auth0ClientOptions
		auth0PopupOptions?: PopupConfigOptions
		auth0LogoutOptions?: LogoutOptions
	}
}

const PROVIDER_ID = "mattel" as const

export interface MattelProviderConnectionResult extends ProviderConnectionResult {
	fcl: Fcl
	auth: FlowExtension["authorization"]
}

export interface ConnectionResult {
	fcl: Fcl,
	magic: InstanceWithExtensions<SDKBase, (FlowExtension | OpenIdExtension)[]>
	auth0: Auth0Client

}

export class MattelConnectionProvider extends
	AbstractConnectionProvider<typeof PROVIDER_ID, MattelProviderConnectionResult> {
	private readonly instance: Observable<any>
	private readonly connection: Observable<ConnectionState<MattelProviderConnectionResult>>

	constructor(
		private config: MattelConnectorConfig
	) {
		super()
		this.instance = cache(() => this._connect())
		this.connection = this.instance.pipe(
			mergeMap((instance) => this.toConnectState(instance)),
			startWith(getStateConnecting({ providerId: PROVIDER_ID })),
		)
	}

	public setPopupConfig(config: PopupConfigOptions) {
		this.config.options = {
			...this.config.options,
			auth0PopupOptions: {
				...(this.config.options?.auth0PopupOptions || {}),
				...(config || {}),
			},
		}
	}

	private toConnectState(
		{ magic, fcl, auth0 }: ConnectionResult
	): Observable<ConnectionState<MattelProviderConnectionResult>> {
		const disconnect = async () => {
			await Promise.all([
				magic.user.logout(),
  			magic.wallet.disconnect(),
				auth0.logout({
					clientId: this.config.auth0ClientId,
					logoutParams: {
						returnTo: window.location.href,
					},
					...(this.config.options?.auth0LogoutOptions || {}),
				}),
			])
		}
		return defer(async () => {
			try {
				if (await isLoggedInPromise(magic)) {
					const user = await magic.user.getMetadata()

					return {
						user,
						fcl,
						auth: magic.flow.authorization,
					}
				}
				const jwt = await auth0Login({
					auth0ClientId: this.config.auth0ClientId,
					auth0Domain: this.config.auth0Domain,
					auth0RedirectUrl: this.config.auth0RedirectUrl,
					auth0,
					auth0PopupOptions: this.config.options?.auth0PopupOptions,
				})
				if (jwt) {
					await magic.openid.loginWithOIDC({
						jwt,
						providerId: this.config.magicProviderId,
					})
				}
				const user = await magic.user.getMetadata()
				return {
					user,
					fcl,
					auth: magic.flow.authorization,
				}
			} catch (e) {
				return { error: e }
			}
		}).pipe(
			map((data: {
				user: MagicUserMetadata,
				auth: typeof magic.flow.authorization,
				fcl: Fcl
			} | { error: unknown } | null) => {
				if (data && "error" in data) {
					return getStateDisconnected({ error: data.error })
				}
				if (!data?.user?.publicAddress) {
					return getStateDisconnected()
				}
				return getStateConnected<MattelProviderConnectionResult>({
					connection: { fcl: data.fcl, address: data.user.publicAddress, auth: data.auth },
					disconnect,
				})
			}),
		)
	}

	private async _connect(): Promise<ConnectionResult> {
		const [
			{ Magic },
			{ FlowExtension },
			{ OpenIdExtension },
			fcl,
			auth0JS,
		] = await Promise.all([
			import("magic-sdk"),
			import("@magic-ext/flow"),
			import("@magic-ext/oidc"),
			import("@onflow/fcl"),
			import("@auth0/auth0-spa-js"),
		])

		const magic = new Magic(this.config.magicAPIKey, {
			extensions: [
				new OpenIdExtension(),
				new FlowExtension({
					rpcUrl: this.config.accessNode,
					network: this.config.network,
				}),
			],
		})
		fcl.config().put("accessNode.api", this.config.accessNode)

		const auth0 = await auth0JS.createAuth0Client({
			domain: this.config.auth0Domain,
			clientId: this.config.auth0ClientId,
			...(this.config.options?.auth0ClientOptions || {}),
		})
		return { fcl, magic, auth0 }
	}

	getId(): string {
		return PROVIDER_ID
	}

	getConnection() {
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
		return !!(await sdk?.fcl.currentUser())
	}
}

export const auth0Login = async ({ auth0, auth0RedirectUrl, auth0ClientId, auth0Domain, auth0PopupOptions }: {
	auth0Domain: string,
	auth0ClientId: string,
	auth0RedirectUrl: string,
	auth0: Auth0Client,
	auth0PopupOptions?: PopupConfigOptions
}) => {
	let isAuthenticated
	try {
		isAuthenticated = await auth0.isAuthenticated()
	} catch (e) {
		isAuthenticated = false
	}

	if (!isAuthenticated) {
		try {
			  await auth0.loginWithPopup({
				authorizationParams: {
					domain: auth0Domain,
					clientId: auth0ClientId,
					redirect_uri: auth0RedirectUrl,
				},
				timeoutInSeconds: 180,
				...(auth0PopupOptions || {}),
			})
		} catch (e) {
			const { PopupTimeoutError } = await import("@auth0/auth0-spa-js")
			if (e instanceof PopupTimeoutError) {
				e.popup.close()
			}
			throw e
		}
	}
	const claims = await auth0.getIdTokenClaims()
	return claims?.__raw
}

async function isLoggedInPromise(magic: InstanceWithExtensions<SDKBase, (FlowExtension | OpenIdExtension)[]>) {
	let handleTimeout: ReturnType<typeof setTimeout>
	const timeoutPromise = new Promise((_resolve, reject) => {
		handleTimeout = setTimeout(() => reject(new Error("Session Checking Timed Out")), 10000)
	})
	return Promise.race([magic.user.isLoggedIn(), timeoutPromise]).then(result => {
		clearTimeout(handleTimeout)
		return result
	})
}
