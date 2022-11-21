import type { ECDSASignature } from "ethereumjs-util"
import { bufferToHex, bufferToInt, ecrecover, keccak256, pubToAddress } from "ethereumjs-util"
import type { Ethereum } from "@rarible/ethereum-provider"

export async function isSigner(ethereum: Ethereum, signer: string, hash: Buffer, signature: string): Promise<boolean> {
	const sig = Buffer.from(skip0x(signature), "hex")
	if (sig.length >= 64 && recover(hash, sig) === signer) {
		return true
	}
	return isErc1271Signer(ethereum, signer, hash, signature)
}

async function isErc1271Signer(ethereum: Ethereum, signer: string, hash: Buffer, signature: string): Promise<boolean> {
	const hashHex = `0x${hash.toString("hex")}`
	console.log("checking signer using erc-1271", hashHex)
	const erc1271 = ethereum.createContract(ABI, signer)
	try {
		const result = await erc1271.functionCall("isValidSignature", hashHex, signature).call()
		if (result !== "0x1626ba7e") {
			console.warn(`isValidSignature result is ${result}`)
			return false
		}
		return true
	} catch (ex) {
		console.error("unable to check signature", ex)
		return false
	}
}

const ABI = [
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_hash",
				"type": "bytes32",
			},
			{
				"internalType": "bytes",
				"name": "_signature",
				"type": "bytes",
			},
		],
		"name": "isValidSignature",
		"outputs": [
			{
				"internalType": "bytes4",
				"name": "",
				"type": "bytes4",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
]

function recover(initialHash: Buffer, signature: Buffer): string {
	const sig = fromRpcSig(signature)
	const [hash, v] = fixHashAndV(sig.v, initialHash)
	return bufferToHex(pubToAddress(ecrecover(hash, v, sig.r, sig.s)))
}

function fixHashAndV(v: number, hash: Buffer): [Buffer, number] {
	if (v === 0 || v === 1) {
		return [hash, 27 + v]
	} else if (v === 27 || v === 28) {
		return [hash, v]
	} else if (v === 32 || v === 31) {
		return [getEthSignedMessageHash(hash), v - 4]
	} else {
		throw new Error(`Value of 'v' is not recognised: ${v}`)
	}
}

const START = "\u0019Ethereum Signed Message:\n"

function getEthSignedMessageHash(hash: Buffer): Buffer {
	return keccak256(Buffer.concat([Buffer.from(`${START}32`, "ascii"), hash]))
}

function fromRpcSig(buf: Buffer): ECDSASignature {
	let r: Buffer
	let s: Buffer
	let v: number
	if (buf.length >= 65) {
		r = buf.slice(0, 32)
		s = buf.slice(32, 64)
		v = bufferToInt(buf.slice(64))
	} else if (buf.length === 64) {
		// Compact Signature Representation (https://eips.ethereum.org/EIPS/eip-2098)
		r = buf.slice(0, 32)
		s = buf.slice(32, 64)
		v = bufferToInt(buf.slice(32, 33)) >> 7
		s[0] &= 0x7f
	} else {
		throw new Error("Invalid signature length")
	}

	// support both versions of `eth_sign` responses
	if (v < 27) {
		v += 27
	}

	return {
		v,
		r,
		s,
	}
}

function skip0x(hex: string) {
	if (hex.startsWith("0x")) {
		return hex.substring(2)
	} else {
		return hex
	}
}
