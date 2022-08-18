export const ENVIRONMENTS = [{
	value: "prod",
	label: "Production"
}, {
	value: "development",
	label: "Development"
}, {
	value: "testnet",
	label: "Testnet"
}]

export function getEnvironmentName(key: string): string {
	return ENVIRONMENTS.find((e) => e.value === key)?.label ?? "unknown"
}
