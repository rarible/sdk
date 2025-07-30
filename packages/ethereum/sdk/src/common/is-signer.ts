import type { ECDSASignature } from "ethereumjs-util"
import { bufferToHex, bufferToInt, ecrecover, keccak256, pubToAddress } from "ethereumjs-util"
import type { Ethereum } from "@rarible/ethereum-provider"
import { verifyMessage, type Address, type Hex } from "viem"

export async function isSigner(ethereum: Ethereum, signer: string, hash: Buffer, signature: string): Promise<boolean> {
  try {
    // Convert to viem format
    const signerAddress = signer as Address
    const messageHash = `0x${hash.toString("hex")}` as Hex
    const signatureHex = signature as Hex

    // Use viem's verifyMessage which handles:
    // - EOA signatures (ECDSA)
    // - EIP-1271 (deployed smart contracts)
    // - EIP-6492 (pre-deployed smart contracts) ← This was missing!
    const isValid = await verifyMessage({
      address: signerAddress,
      message: { raw: messageHash },
      signature: signatureHex,
    })

    console.log(`viem signature verification: ${isValid} for signer: ${signer}`)
    return isValid
  } catch (error: any) {
    console.error("viem signature verification failed:", error.message || error)

    // Fallback to legacy verification for backward compatibility
    console.log("Falling back to legacy verification...")
    return legacyIsSigner(ethereum, signer, hash, signature)
  }
}

// Legacy verification as fallback (your previous implementation)
async function legacyIsSigner(ethereum: Ethereum, signer: string, hash: Buffer, signature: string): Promise<boolean> {
  const sig = Buffer.from(skip0x(signature), "hex")

  // First, try standard ECDSA recovery for EOA wallets
  // Only attempt ECDSA if signature looks like standard ECDSA format (65 or 64 bytes)
  if (sig.length === 64 || sig.length === 65) {
    try {
      const recoveredAddress = recover(hash, sig)
      if (recoveredAddress.toLowerCase() === signer.toLowerCase()) {
        return true
      }
    } catch (e) {
      // ECDSA recovery failed, continue to smart contract verification
      console.log("ECDSA recovery failed, trying EIP-1271:", e)
    }
  }

  // For non-standard signature formats or failed ECDSA, try EIP-1271
  // This handles smart contract wallets, but NOT pre-deployed ones
  return isErc1271Signer(ethereum, signer, hash, signature)
}

async function isErc1271Signer(ethereum: Ethereum, signer: string, hash: Buffer, signature: string): Promise<boolean> {
  const hashHex = `0x${hash.toString("hex")}`
  console.log("checking signer using erc-1271", hashHex, "signature length:", signature.length)

  // Create contract instance for EIP-1271 verification
  const erc1271 = ethereum.createContract(ABI, signer)

  try {
    // Call isValidSignature on the smart contract
    const result = await erc1271.functionCall("isValidSignature", hashHex, signature).call()

    // EIP-1271 magic value: bytes4(keccak256("isValidSignature(bytes32,bytes)"))
    const EIP1271_MAGIC_VALUE = "0x1626ba7e"

    if (result === EIP1271_MAGIC_VALUE) {
      console.log("EIP-1271 signature verification successful")
      return true
    } else {
      console.warn(`EIP-1271 verification failed. Expected: ${EIP1271_MAGIC_VALUE}, Got: ${result}`)
      return false
    }
  } catch (ex: any) {
    // Better error handling for different failure scenarios
    if (ex.message?.includes("execution reverted")) {
      console.log("Contract exists but signature verification failed")
    } else if (ex.message?.includes("call exception")) {
      console.log("Address is not a contract or does not implement EIP-1271")
    } else {
      console.error("EIP-1271 verification error:", ex.message || ex)
    }
    return false
  }
}

const ABI = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_hash",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "_signature",
        type: "bytes",
      },
    ],
    name: "isValidSignature",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
    stateMutability: "view",
    type: "function",
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
  // @ts-ignore - Pre-existing Buffer/Uint8Array type compatibility issue
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
