import { providerAsMiddleware, providerFromEngine } from "eth-json-rpc-middleware"
import { JsonRpcEngine } from "json-rpc-engine"
import type { SafeEventEmitterProvider } from "eth-json-rpc-middleware/dist/utils/cache"
import { biconomyMiddleware } from "./middleware"
import type { IBiconomyConfig, IContractRegistry, ILimitsRegistry } from "./types"

/**
 * Apply biconomy middleware to provider
 * @param provider web3 provider
 * @param registry contracts registry
 * @param limitsRegistry registry that checks limits of user or whole dapp
 * @param config config for biconomy provider instance
 */
export function withBiconomyMiddleware(
	provider: any,
	registry: IContractRegistry,
	limitsRegistry: ILimitsRegistry,
	config: IBiconomyConfig
): SafeEventEmitterProvider {
	const engine = new JsonRpcEngine()
	engine.push(biconomyMiddleware(provider, registry, limitsRegistry, config))
	engine.push(providerAsMiddleware(provider as any))
	return providerFromEngine(engine)
}
