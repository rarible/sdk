export const ENVIRONMENTS = [{
	value: "prod",
	label: "Production"
}, {
	value: "staging",
	label: "Staging"
}, {
	value: "dev",
	label: "Dev"
}, {
	value: "development",
	label: "Development"
}, {
	value: "e2e",
	label: "Rarible e2e"
}]

export function getEnvironmentName(key: string): string {
	return ENVIRONMENTS.find((e) => e.value === key)?.label ?? "unknown"
}
