export const cutString = (str?: string, size?: number): string => {
	if (str && size && size - 5 < str.length) {
		return `${str.slice(0, size - 5)}...${str.slice(-4)}`
	}

	return str ?? ""
}