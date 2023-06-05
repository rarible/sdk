import type { Maybe } from "@rarible/types"
import type { RaribleSdkProvider } from "@rarible/sdk-wallet"
import type { RaribleSdkEnvironment } from "../../../config/domain"
import type { IRaribleSdkConfig } from "../../../domain"
import { LogsLevel } from "../../../domain"
import { createRaribleSdk } from "../../../index"

export function createSdk(
	provider: Maybe<RaribleSdkProvider>,
	env: RaribleSdkEnvironment,
	config?: IRaribleSdkConfig
) {
	return createRaribleSdk(provider, env, {
		logs: LogsLevel.DISABLED,
		apiKey: process?.env?.SDK_API_KEY || undefined,
		...config,
	}
	)
}
