import { e2eConfig } from "./e2e"
import { devConfig } from "./dev"
import { stagingConfig } from "./staging"
import { prodConfig } from "./prod"
import type { RaribleSdkConfig, RaribleSdkEnvironment } from "./domain"

export const configsDictionary: Record<RaribleSdkEnvironment, RaribleSdkConfig> = {
	dev: devConfig,
	e2e: e2eConfig,
	staging: stagingConfig,
	prod: prodConfig,
}

export function getSdkConfig(env: RaribleSdkEnvironment): RaribleSdkConfig {
	return configsDictionary[env]
}
