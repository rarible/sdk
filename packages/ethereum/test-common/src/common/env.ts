export function readEnv(envName: string) {
	const val = readEnvWithDefault(envName, undefined)
	if (!val) throw new Error(`No environment ${envName} declared in runtime`)
	return val
}

export function readEnvWithDefault<T>(envName: string, defaultValue: T): string | T {
	if (typeof process === "undefined") throw new Error("Not a NodeJS environment")
	return process.env[envName] ?? defaultValue
}