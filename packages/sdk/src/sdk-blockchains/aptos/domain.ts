export type AptosTokenMetadata = {
	name: string | undefined
	description: string | undefined
	image: string
	"animation_url": string
	"external_url": string
	attributes: Array<{ "trait_type": string, value: string }>
}
