export const formatAddress = (address: string | undefined, chars = 6): string => {
	if (!address || address.length <= chars * 2) return address || ''
	return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`
}

export const formatNumber = (
	string: string | number | undefined | null,
	maximumFractionDigits: number | undefined = 2
) => {
	if (string === undefined || string === null) return '0'

	if (!Number.isNaN(Number(string)))
		return Number(string).toLocaleString('en-US', { maximumFractionDigits })

	return String(string)
}
