import type { RaribleSdkEnvironment } from "@rarible/sdk/build/config/domain"
import type { EnvironmentDictionary } from "./domain"

export class EnvironmentUtils {
	private readonly environmentPersistKey = "saved_environment"
	private readonly defaultEnvironment = "testnet"

	readonly allowedEnvironments = Object.keys(this.environments) as RaribleSdkEnvironment[]

	constructor(readonly environments: EnvironmentDictionary) {}

	getConfig = (x: RaribleSdkEnvironment) => this.environments[x]

	isEnvironment = (x: string): x is RaribleSdkEnvironment => {
		return this.allowedEnvironments.includes(x as RaribleSdkEnvironment)
	}

	getLabel = (x: RaribleSdkEnvironment) => this.getConfig(x).label

	getSavedEnvironment = (): RaribleSdkEnvironment | undefined => {
		const saved = localStorage.getItem(this.environmentPersistKey)
		if (saved && this.isEnvironment(saved)) {
			return saved
		}
		return undefined
	}

	updateSavedEnvironment = (x: RaribleSdkEnvironment) => {
		localStorage.setItem(this.environmentPersistKey, x)
	}

	getDefaultEnvironment = (): RaribleSdkEnvironment => {
		return this.getSavedEnvironment() || this.defaultEnvironment
	}
}
