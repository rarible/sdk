import axios from "axios"
import mimeTypes from "mime-types"
import { v4 } from "uuid"
import { Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import { toUnionAddress } from "@rarible/types"
import type {
	CommonTokenContent,
	IPreprocessMeta,
	PreprocessMetaRequest,
} from "../../../types/nft/mint/preprocess-meta"
import type { UnionPart } from "../../../types/order/common"
import { NFT_STORAGE_URL } from "../../../config"
import type {
	IPFSHash,
	IPFSServiceResponse,
	MetaUploadRequest,
	NftStorageResponse,
	UploadedFolder,
	UploadMetaResponse,
} from "./domain"

const FILE = "file"
const FOLDER_PREFIX = "/folder/"
const IPFS_GATEWAY_URL = "https://ipfs.rarible.com/ipfs"

export class MetaUploader {
	constructor(
		readonly blockchain: Blockchain,
		readonly preprocessMeta: IPreprocessMeta
	) {
		this.preprocessMeta = preprocessMeta
		this.uploadMeta = this.uploadMeta.bind(this)
		this.uploadFile = this.uploadFile.bind(this)
		this.uploadFolder = this.uploadFolder.bind(this)
	}

	private getRoyalties(royalty: string, account: UnionAddress): UnionPart | undefined {
		const value = parseFloat(royalty)
		return !isNaN(value) ? { account, value } : undefined
	}

	async uploadMeta(request: MetaUploadRequest): Promise<UploadMetaResponse> {
		const { nftStorageApiKey, properties, royalty, accountAddress } = request

		const { files } = await this.uploadFolder( nftStorageApiKey, {
			image: properties.image,
			animation: properties.animationUrl,
		})
		const blockchain = accountAddress.split(":")[0]
		if (!(blockchain in Blockchain)) {
			throw new Error(`Value: "${blockchain}" is not a supported blockchain type`)
		}

		const metadataRequest = {
			blockchain: this.blockchain,
			name: properties.name,
			description: properties.description,
			image: files.image && mapToCommonTokenContent(files.image),
			animation: files.animation && mapToCommonTokenContent(files.animation),
			external: undefined,
			attributes: properties.attributes.map(prop => ({
				key: prop.key,
				trait_type: prop.key,
				value: prop.value,
			})),
		} as PreprocessMetaRequest
		if (metadataRequest.blockchain === "SOLANA") {
			metadataRequest.royalties = this.getRoyalties(royalty, toUnionAddress(accountAddress))
		}

		const metadata = this.preprocessMeta(metadataRequest)
		const file = createJson("properties.json", metadata)
		return this.uploadFile(nftStorageApiKey, file)
	}

	async uploadFile(nftStorageApiKey: string, file: File): Promise<UploadMetaResponse> {
		const formData = new FormData()
		const name = createFilename(file)
		formData.append("file", file, name)

		const { ipfsHash } = await uploadDataToProvider(nftStorageApiKey, formData)
		return {
			originalFile: file,
			URL: resolveRealUrl(ipfsHash),
			IPFSURL: toNodeAgnosticURL(ipfsHash),
		}
	}

	async uploadFolder(nftStorageApiKey: string, upload: Record<string, File | undefined>) {
		const formData = new FormData()
		const keys = Object.keys(upload).filter(x => Boolean(upload[x]))

		keys.forEach(key => {
			const file = upload[key] as File
			const name = `/folder/${key}.${mimeTypes.extension(file.type)}`
			formData.append("file", file, name)
		})

		const { ipfsHash } = await uploadDataToProvider(nftStorageApiKey, formData)
		const files = keys.reduce((prev, key) => {
			const file = upload[key] as File
			const name = `${key}.${mimeTypes.extension(file.type)}`
			const suffix = `${ipfsHash}/${name}`
			const ipfsUrl = toNodeAgnosticURL(suffix)
			return {
				...prev,
				[key]: {
					URL: resolveRealUrl(ipfsUrl),
					IPFSURL: ipfsUrl,
					originalFile: file,
				},
			}
		}, {} as Record<string, UploadMetaResponse>)

		return { files, hash: ipfsHash } as UploadedFolder
	}
}

function toNodeAgnosticURL(suffix: string | IPFSHash) {
	return `ipfs://ipfs/${suffix}` as IPFSHash
}

async function uploadDataToProvider(nftStorageApiKey: string, data: FormData): Promise<IPFSServiceResponse> {
	if (nftStorageApiKey === undefined) {
		throw new Error("Provide NFT_STORAGE_API_KEY as environment variables!")
	}
	const req = transformNftStorageFormData(data)
	const nftStorageResponse = (
		await axios.create().post<NftStorageResponse>(NFT_STORAGE_URL, req, {
			headers: { Authorization: `Bearer ${nftStorageApiKey}` },
		})
	).data
	return {
		ipfsHash: nftStorageResponse.value.cid,
		size: nftStorageResponse.value.size,
	}
}

function transformNftStorageFormData(data: FormData): File | FormData {
	const files: Array<File> = data.getAll(FILE).filter(f => f instanceof File).map(f => f as File)
	const isFolder = files.some(f => f.name.startsWith(FOLDER_PREFIX))
	if (files.length === 1 && !isFolder) return files[0]
	const transformFiles = files.map(f => new File([f], f.name.replace(FOLDER_PREFIX, ""), { type: f.type }))
	const transformFormData = new FormData()
	transformFiles.forEach(file => transformFormData.append(FILE, file, file.name))
	return transformFormData
}


function resolveRealUrl(urlOrSuffix: string): string {
	if (["http", "blob", "data"].some(x => urlOrSuffix.startsWith(x))) {
		return urlOrSuffix
	}
	try {
		const suffix = extractIpfsSuffix(urlOrSuffix)
		return `${IPFS_GATEWAY_URL}/${suffix}`
	} catch (_) {
		return `${IPFS_GATEWAY_URL}/${urlOrSuffix}`
	}
}

function extractIpfsSuffix(str: string) {
	if (str.startsWith("ipfs://ipfs/")) {
		return str.substring("ipfs://ipfs/".length)
	}
	if (str.startsWith("ipfs:///ipfs/")) {
		return str.substring("ipfs:///ipfs/".length)
	}
	if (str.indexOf("/ipfs/") !== -1) {
		const offset = str.indexOf("/ipfs/")
		return str.substring(offset + "/ipfs/".length)
	}
	if (str.startsWith("ipfs://")) {
		return str.substring("ipfs://".length)
	}
	throw new Error("Cannot extract IPFS hash")
}

const createFilename = (file: File) => {
	const extension = mimeTypes.extension(file.type)
	if (!extension) {
		throw new Error("Can't determine file type")
	}
	const hash = v4()
	return `${hash}.${extension}`
}

function mapToCommonTokenContent(file: UploadMetaResponse): CommonTokenContent {
	if (!file.originalFile.type) {
		throw new Error("Unknown file type or your browser can't detect correct file type. Make sure your file have valid extension")
	}
	return {
		url: file.IPFSURL,
		mimeType: file.originalFile.type,
		fileSize: file.originalFile.size,
		fileName: file.originalFile.name,
	}
}

function createFile(blobs: string[], mime: string, name: string): File {
	return new File(blobs, name, {
		type: mime,
	})
}

function createJson(name: string, data: Record<string, any>) {
	return createFile([JSON.stringify(data)], "application/json", name)
}
