import { ethers } from "ethers"
import { BN } from "ethereumjs-util"

const EthersAbiCoder = ethers.utils.AbiCoder
const ParamType = ethers.utils.ParamType
const ethersAbiCoder = new EthersAbiCoder(function (type, value) {
	if (type.match(/^u?int/) && !Array.isArray(value) && (Object.prototype.toString.call(value) !== "[object Object]" || value.constructor.name !== "BN")) {
		return value.toString()
	}
	return value
})

export function encodeParameters(types: any[], params: any[]) {
	types = mapTypes(types)

	params = params.map(function (param, index) {
		let type = types[index]
		if (typeof type === "object" && type.type) {
			// We may get a named type of shape {name, type}
			type = type.type
		}

		param = formatParam(type, param)

		// Format params for tuples
		if (typeof type === "string" && type.includes("tuple")) {
			const coder = ethersAbiCoder._getCoder(ParamType.from(type))
			const modifyParams = (cod: typeof coder, param: any) => {
				if (cod.name === "array") {
					return param.map((p: any) =>
						modifyParams(
							ethersAbiCoder._getCoder(ParamType.from(cod.type.replace("[]", ""))),
							p
						)
					)
				}
				// @ts-ignore
				const { coders } = cod
				coders.forEach((c: any, i: any) => {
					if (c.name === "tuple") {
						modifyParams(c, param[i])
					} else {
						param[i] = formatParam(c.name, param[i])
					}
				})
			}
			modifyParams(coder, param)
		}

		return param
	})

	return ethersAbiCoder.encode(types, params)
}

export function decodeParameters(types: any[], data: string) {
	types = mapTypes(types)

	return ethersAbiCoder.decode(types, data)
}

function mapTypes(types: any[]) {
	const mappedTypes: (string | object)[] = []
	types.forEach(function (type) {
		// Remap `function` type params to bytes24 since Ethers does not
		// recognize former type. Solidity docs say `Function` is a bytes24
		// encoding the contract address followed by the function selector hash.
		if (typeof type === "object" && type.type === "function") {
			type.type = "bytes24"
		}
		if (isSimplifiedStructFormat(type)) {
			const structName = Object.keys(type)[0]
			mappedTypes.push(
				Object.assign(
					mapStructNameAndType(structName),
					{
						components: mapStructToCoderFormat(type[structName]),
					}
				)
			)

			return
		}

		mappedTypes.push(type)
	})

	return mappedTypes
}

function formatParam(type: any, param: any) {
	const paramTypeBytes = new RegExp(/^bytes([0-9]*)$/)
	const paramTypeBytesArray = new RegExp(/^bytes([0-9]*)\[\]$/)
	const paramTypeNumber = new RegExp(/^(u?int)([0-9]*)$/)
	const paramTypeNumberArray = new RegExp(/^(u?int)([0-9]*)\[\]$/)

	// Format BN to string
	if (BN.isBN(param) || (param && param.constructor && param.constructor.name === "BigNumber")) {
		return (param as number | BN).toString(10)
	}

	if (type.match(paramTypeBytesArray) || type.match(paramTypeNumberArray)) {
		return param.map((p: any) => formatParam(type.replace("[]", ""), p))
	}

	// Format correct width for u?int[0-9]*
	let match = type.match(paramTypeNumber)
	if (match) {
		let size = parseInt(match[2] || "256")
		if (size / 8 < param.length) {
			// pad to correct bit width
			param = ethers.utils.hexZeroPad(param, size)
		}
	}

	// Format correct length for bytes[0-9]+
	match = type.match(paramTypeBytes)
	if (match) {
		if (Buffer.isBuffer(param)) {
			param = ethers.utils.hexlify(param)
		}

		// format to correct length
		let size = parseInt(match[1])
		if (size) {
			let maxSize = size * 2
			if (param.substring(0, 2) === "0x") {
				maxSize += 2
			}
			if (param.length < maxSize) {
				// pad to correct length
				const rightPad = function (string: string | number, chars: number) {
					const hasPrefix = typeof string === "number" || /^0x/i.test(string)
					string = string.toString(16).replace(/^0x/i, "")

					const padding = (chars - string.length + 1 >= 0) ? chars - string.length + 1 : 0

					return (hasPrefix ? "0x" : "") + string + (new Array(padding).join("0"))
				}
				param = rightPad(param, size * 2)
			}
		}

		// format odd-length bytes to even-length
		if (param.length % 2 === 1) {
			param = "0x0" + param.substring(2)
		}
	}

	return param
}

function mapStructNameAndType(structName: string) {
	let type = "tuple"

	if (structName.indexOf("[]") > -1) {
		type = "tuple[]"
		structName = structName.slice(0, -2)
	}

	return { type: type, name: structName }
}

function mapStructToCoderFormat(struct: { [index: string]: any }): any[] {
	const components: any[] = []
	Object.keys(struct).forEach(function (key) {
		if (typeof struct[key] === "object") {
			components.push(
				Object.assign(
					mapStructNameAndType(key),
					{
						components: mapStructToCoderFormat(struct[key]),
					}
				)
			)

			return
		}

		components.push({
			name: key,
			type: struct[key],
		})
	})

	return components
}

function isSimplifiedStructFormat(type: string | { components: any, name: any }): boolean {
	return typeof type === "object" && typeof type.components === "undefined" && typeof type.name === "undefined"
}
