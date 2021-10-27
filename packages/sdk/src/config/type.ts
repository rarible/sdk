import { CONFIGS } from "@rarible/protocol-ethereum-sdk/build/config"

export type Config = {
	basePath: string,
	ethereumEnv: keyof typeof CONFIGS,
}
