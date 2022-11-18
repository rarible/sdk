
export function sanitizeUri(contractPrefix: string, uriRaw: string): string {
	const fixedContractPrefix = fixContractPrefix(contractPrefix)
	if (!uriRaw.startsWith(fixedContractPrefix)) {
		throw new Error(`uri must start with: ${fixedContractPrefix}`)
	}
	return uriRaw.slice(fixedContractPrefix.length) || ""
}

/**
 * Workaround for older contracts where contract uri is set to http link
 */
function fixContractPrefix(contractPrefix: string): string {
	return contractPrefix
		.replace("https://ipfs.daonomic.com", "ipfs:/")
		.replace("https://ipfs.rarible.com", "ipfs:/")
}
