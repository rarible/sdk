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

export type FclConfig = {
	accessNode: string
	network: string
	magicAPIKey: string
	magicProviderId: string
	auth0Domain: string
	auth0ClientId: string
	auth0RedirectUrl: string
}

const PROVIDER_ID = "mattel" as const

export interface MattelProviderConnectionResult extends ProviderConnectionResult {
	fcl: Fcl
	auth: FlowExtension["authorization"]
}

export interface ConnectionResult {
	fcl: Fcl,
	magic: InstanceWithExtensions<SDKBase, (FlowExtension | OpenIdExtension)[]>
}

export class MattelConnectionProvider extends
	AbstractConnectionProvider<typeof PROVIDER_ID, MattelProviderConnectionResult> {
	private readonly instance: Observable<any>
	private readonly connection: Observable<ConnectionState<MattelProviderConnectionResult>>

	constructor(
		private readonly config: FclConfig
	) {
		super()
		this.instance = cache(() => this._connect())
		this.connection = this.instance.pipe(
			mergeMap((instance) => this.toConnectState(instance)),
			startWith(getStateConnecting({ providerId: PROVIDER_ID })),
		)
	}

	private toConnectState(result: ConnectionResult): Observable<ConnectionState<MattelProviderConnectionResult>> {
		const disconnect = async () => {
			await Promise.all([
				result.magic.user.logout(),
  			result.magic.wallet.disconnect(),
			])
		}
		return defer(async () => {
			try {
				if (await result.magic.user.isLoggedIn()) {
					const user = await result.magic.user.getMetadata()

					console.log("fcl", result.fcl, "magic flow", result.magic.flow)
					return {
						user,
						auth: result.magic.flow.authorization,
						fcl: result.fcl,
					}
				}
				const jwt = await auth0Login({
					auth0ClientId: this.config.auth0ClientId,
					auth0Domain: this.config.auth0Domain,
					auth0RedirectUrl: this.config.auth0RedirectUrl,
				})
				if (jwt) {
					await result.magic.openid.loginWithOIDC({
						jwt,
						providerId: this.config.magicProviderId,
					})
				}
				const user = await result.magic.user.getMetadata()
				console.log("result.magic.flow", result.magic.flow, "fcl", result.fcl)
				return {
					user,
					auth: result.magic.flow.authorization,
					fcl: result.fcl,
				}
			} catch (e) {}
			return null
		}).pipe(
			map((data: {
				user: MagicUserMetadata,
				auth: typeof result.magic.flow.authorization,
				fcl: Fcl
			} | null) => {
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
		const { Magic } = await import("magic-sdk")
		const { FlowExtension } = await import("@magic-ext/flow")
		const { OpenIdExtension } = await import("@magic-ext/oidc")
		const fcl = await import("@onflow/fcl")

		const magic = new Magic(this.config.magicAPIKey, {
			extensions: [
				new OpenIdExtension(),
				new FlowExtension({
					rpcUrl: this.config.accessNode,
					network: this.config.network,
				}),
			],
		})
		console.log("magic", magic)
		fcl.config().put("accessNode.api", this.config.accessNode)

		return { fcl, magic }
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

export const auth0Login = async (options: {auth0Domain: string, auth0ClientId: string, auth0RedirectUrl: string}) => {
	const { createAuth0Client, PopupTimeoutError } = await import("@auth0/auth0-spa-js")

	const auth0 = await createAuth0Client({
		domain: options.auth0Domain,
		clientId: options.auth0ClientId,
	})

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
					domain: options.auth0Domain,
					clientId: options.auth0ClientId,
					redirect_uri: options.auth0RedirectUrl,
				},
			})
		} catch (e) {
			if (e instanceof PopupTimeoutError) {
				e.popup.close()
			}
			throw e
		}
	}
	const claims = await auth0.getIdTokenClaims()
	return claims?.__raw
}
