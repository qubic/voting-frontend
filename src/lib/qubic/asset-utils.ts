/**
 * Utility functions for asset operations in Qubic polls
 */

import { NULL_ID } from './constants'

export interface PollAsset {
	issuer: string
	assetName: string
}

export interface UserAsset {
	issuerIdentity: string
	assetName: string
	ownedAmount: number
}

/**
 * Check if a poll asset matches a user asset
 */
export const isAssetMatch = (pollAsset: PollAsset, userAsset: UserAsset): boolean => {
	const issuerMatch = pollAsset.issuer === userAsset.issuerIdentity
	const nameMatch = pollAsset.assetName === userAsset.assetName
	
	// Debug logging
	console.log('🔍 Asset matching debug:', {
		pollAsset: {
			issuer: pollAsset.issuer,
			assetName: pollAsset.assetName
		},
		userAsset: {
			issuerIdentity: userAsset.issuerIdentity,
			assetName: userAsset.assetName,
			ownedAmount: userAsset.ownedAmount
		},
		issuerMatch,
		nameMatch,
		fullMatch: issuerMatch && nameMatch
	})
	
	return issuerMatch && nameMatch
}

/**
 * Find a user asset that matches a poll asset
 */
export const findMatchingUserAsset = (
	pollAsset: PollAsset,
	userAssets: UserAsset[]
): UserAsset | undefined => {
	return userAssets.find((userAsset) => isAssetMatch(pollAsset, userAsset))
}

/**
 * Check if user has any of the allowed assets for a poll
 */
export const hasAnyAllowedAsset = (pollAssets: PollAsset[], userAssets: UserAsset[]): boolean => {
	return userAssets.some((userAsset) =>
		pollAssets.some((pollAsset) => isAssetMatch(pollAsset, userAsset))
	)
}

/**
 * Check if user has sufficient balance of any allowed assets
 */
export const hasSufficientAssetBalance = (
	pollAssets: PollAsset[],
	userAssets: UserAsset[],
	minAmount: number
): boolean => {
	return userAssets.some((userAsset) =>
		pollAssets.some(
			(pollAsset) => isAssetMatch(pollAsset, userAsset) && userAsset.ownedAmount >= minAmount
		)
	)
}

/**
 * Get user's balance for a specific poll asset
 */
export const getUserAssetBalance = (pollAsset: PollAsset, userAssets: UserAsset[]): number => {
	const userAsset = findMatchingUserAsset(pollAsset, userAssets)
	return userAsset ? userAsset.ownedAmount : 0
}

/**
 * Filter out invalid assets (NULL_ID or 'N/A')
 */
export const filterValidAssets = (assets: PollAsset[]): PollAsset[] => {
	return assets.filter((asset) => asset.issuer !== NULL_ID && asset.assetName !== 'N/A')
}
