/**
 * Poll options configuration
 * Maps poll IDs to custom option labels
 */

export interface PollOptionsConfig {
	pollOptionLabels: Record<string, Record<string, string>>
	_comment?: string // Optional comment field for documentation
}

let configCache: PollOptionsConfig | null = null

/**
 * Loads the poll options configuration from the public JSON file
 */
export async function loadPollOptionsConfig(): Promise<PollOptionsConfig> {
	if (configCache) {
		return configCache
	}

	try {
		const response = await fetch('/poll-options-config.json')
		if (!response.ok) {
			throw new Error(`Failed to load poll options config: ${response.statusText}`)
		}
		const config = await response.json()
		configCache = config as PollOptionsConfig
		return configCache
	} catch (error) {
		console.warn('Failed to load poll options config, using defaults:', error)
		return { pollOptionLabels: {} }
	}
}

/**
 * Gets the custom label for a specific poll option
 * @param pollId - The poll ID
 * @param option - The option number (0-63)
 * @returns The custom label if configured, otherwise null
 */
export async function getPollOptionLabel(
	pollId: number,
	option: number
): Promise<string | null> {
	const config = await loadPollOptionsConfig()
	const pollConfig = config.pollOptionLabels[pollId.toString()]
	if (!pollConfig) {
		return null
	}
	return pollConfig[option.toString()] || null
}

/**
 * Gets all custom option labels for a poll
 * @param pollId - The poll ID
 * @returns Map of option numbers to labels, or null if poll has no custom config
 */
export async function getPollOptionLabels(
	pollId: number
): Promise<Record<number, string> | null> {
	const config = await loadPollOptionsConfig()
	const pollConfig = config.pollOptionLabels[pollId.toString()]
	if (!pollConfig) {
		return null
	}

	const result: Record<number, string> = {}
	for (const [optionStr, label] of Object.entries(pollConfig)) {
		result[Number(optionStr)] = label as string
	}
	return result
}

/**
 * Gets the list of available option numbers for a poll with custom config
 * @param pollId - The poll ID
 * @returns Array of option numbers, or null if poll has no custom config
 */
export async function getPollAvailableOptions(pollId: number): Promise<number[] | null> {
	const labels = await getPollOptionLabels(pollId)
	if (!labels) {
		return null
	}
	return Object.keys(labels)
		.map(Number)
		.sort((a, b) => a - b)
}

