import type { InputField } from './types'

export const safeParse = (v: unknown) => parseInt(String(v ?? 0), 10)

export const safeParseArray = (value: unknown, fieldName: string): unknown[] => {
	if (typeof value === 'string') {
		try {
			return JSON.parse(value)
		} catch {
			console.error(`Invalid JSON for array field "${fieldName}":`, value)
			return []
		}
	}
	return Array.isArray(value) ? value : []
}

export const parseContract = (
	content: string
): {
	contractName: string | null
	functions: Array<{
		name: string
		type: 'view' | 'transaction'
		index: number
		inputs: InputField[]
		outputs: InputField[]
	}>
} => {
	const nameMatch = /struct\s+(\w+)\s*:\s*public\s+ContractBase/.exec(content)
	const contractName = nameMatch?.[1] ?? null

	const functions = [
		...content.matchAll(/REGISTER_USER_(FUNCTION|PROCEDURE)\(\s*(\w+)\s*,\s*(\d+)\s*\)/g)
	].map((match) => {
		const [, type, name, index] = match
		return {
			name,
			type: type === 'FUNCTION' ? ('view' as const) : ('transaction' as const),
			index: parseInt(index, 10),
			inputs: parseParameters(content, name, 'input') as InputField[],
			outputs: parseParameters(content, name, 'output') as InputField[]
		}
	})

	return {
		contractName,
		functions
	}
}

export const parseParameters = (content: string, fn: string, dir: 'input' | 'output') => {
	const struct = new RegExp(`struct\\s+${fn}_${dir}\\s*\\{([^}]*)\\}`, 's').exec(content)?.[1]
	if (struct) {
		return [
			...struct.matchAll(/(Array<(\w+)\s*,\s*(\w+)>|(\w+(?:\[\d+\])?))\s+(\w+)\s*;/g)
		].map((m) =>
			m[1]
				? { type: 'Array', elementType: m[2], size: m[3], name: m[5] }
				: { type: m[4], name: m[5] }
		)
	}

	const typedef = new RegExp(`typedef\\s+([A-Za-z0-9_<>]+)\\s+${fn}_${dir}`).exec(content)?.[1]
	if (typedef) {
		return [
			{
				type: typedef,
				name: 'data',
				description: 'JSON structure for this complex type'
			}
		]
	}

	return []
}
