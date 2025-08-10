import { PublicKey } from '@qubic-lib/qubic-ts-library/dist/qubic-types/PublicKey'
import { QubicDefinitions } from '@qubic-lib/qubic-ts-library/dist/QubicDefinitions'
import { QubicHelper } from '@qubic-lib/qubic-ts-library/dist/qubicHelper'

import { POLL_TYPE } from './types'

export const qHelper = new QubicHelper()

const KNOWN_CONSTANTS: Record<string, number> = {
	MSVAULT_MAX_OWNERS: 16,
	MSVAULT_MAX_COOWNER: 8,
	'1024': 1024
}

export const resolveSize = (sizeStr?: string): number => {
	if (!sizeStr) return 0
	if (/^\d+$/.test(sizeStr)) return parseInt(sizeStr, 10)
	return KNOWN_CONSTANTS[sizeStr] ?? 0
}

export const isArrayType = (t: string) => {
	const m = RegExp(/^(.+)\[(\d+)\]$/).exec(t)
	return m ? { base: m[1], len: parseInt(m[2], 10) } : null
}

/**
 * Get human-readable poll type name
 */
export function getPollTypeName(pollType: POLL_TYPE) {
	switch (pollType) {
		case POLL_TYPE.QUBIC:
			return 'Qubic (QU) Based'
		case POLL_TYPE.ASSET:
			return 'Asset/Token Based'
		default:
			return 'Unknown'
	}
}

/**
 * Creates a contract public key for smart contract transactions.
 */
const getContractPublicKey = (contractIndex: number): PublicKey => {
	const keyBytes = new Uint8Array(QubicDefinitions.PUBLIC_KEY_LENGTH)
	keyBytes.fill(0)
	keyBytes[0] = contractIndex
	return new PublicKey(keyBytes)
}

/**
 * Get a contract identity for smart contract transactions.
 */
export const getContracIdentity = async (contractIndex: number): Promise<string> => {
	const contractPublicKey = getContractPublicKey(contractIndex)
	const contractIdentity = await qHelper.getIdentity(contractPublicKey.getPackageData())
	return contractIdentity
}
