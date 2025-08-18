import { useCallback, useEffect, useMemo, useState } from 'react'

import { useQUtilContract, useWalletConnect } from '@/hooks'
import type { PollWithResults } from '@/types'

import { fetchActivePolls, fetchInactivePolls, fetchPollWithResults } from '../helpers/poll.helpers'
import type { PollsListType } from '../types'

export function usePolls(type: PollsListType) {
	const [polls, setPolls] = useState<PollWithResults[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const { getCurrentPollId, getPollInfo, getCurrentResult, getPollsByCreator } =
		useQUtilContract()
	const { isWalletConnected, selectedAccount } = useWalletConnect()

	// Memoize the contract functions to prevent unnecessary re-renders
	const memoizedContractFunctions = useMemo(
		() => ({
			getCurrentPollId,
			getPollInfo,
			getCurrentResult,
			getPollsByCreator
		}),
		[getCurrentPollId, getPollInfo, getCurrentResult, getPollsByCreator]
	)

	const loadMyPolls = useCallback(async () => {
		try {
			if (!isWalletConnected || !selectedAccount) {
				setPolls([])
				return
			}

			const creatorPollsData = await memoizedContractFunctions.getPollsByCreator(
				selectedAccount.address
			)
			if (!creatorPollsData.success || !creatorPollsData.data) {
				setPolls([])
				return
			}

			const { poll_ids } = creatorPollsData.data

			// Filter out poll ID 0 as it's a placeholder when no polls exist
			const validPollIds = poll_ids.filter((id) => id !== 0)

			if (validPollIds.length === 0) {
				setPolls([])
				return
			}

			const pollResults = await Promise.all(
				validPollIds.map((pollId) =>
					fetchPollWithResults(
						pollId,
						memoizedContractFunctions.getPollInfo,
						memoizedContractFunctions.getCurrentResult
					)
				)
			)
			const validPolls = pollResults.filter((poll): poll is PollWithResults => poll !== null)

			setPolls(validPolls)
		} catch (error) {
			console.error('Failed to load my polls:', error)
			setError('Failed to load your polls')
		}
	}, [memoizedContractFunctions, isWalletConnected, selectedAccount])

	const loadPublicPolls = useCallback(async () => {
		try {
			const currentPollData = await memoizedContractFunctions.getCurrentPollId()
			if (!currentPollData.success || !currentPollData.data) {
				setPolls([])
				return
			}

			const { current_poll_id, active_poll_ids, active_count } = currentPollData.data

			if (type === 'active') {
				// Only load active polls
				const activePolls = await fetchActivePolls(
					active_poll_ids,
					active_count,
					memoizedContractFunctions.getPollInfo,
					memoizedContractFunctions.getCurrentResult
				)
				setPolls(activePolls)
			} else if (type === 'inactive') {
				// Only load inactive polls
				const inactivePolls = await fetchInactivePolls(
					current_poll_id,
					active_poll_ids,
					16,
					memoizedContractFunctions.getPollInfo,
					memoizedContractFunctions.getCurrentResult
				)
				setPolls(inactivePolls)
			}
		} catch (error) {
			console.error('Failed to load public polls:', error)
			setError('Failed to load polls')
		}
	}, [memoizedContractFunctions, type])

	const loadPolls = useCallback(async () => {
		setLoading(true)
		setError(null)

		try {
			if (type === 'my-polls') {
				await loadMyPolls()
			} else {
				await loadPublicPolls()
			}
		} finally {
			setLoading(false)
		}
	}, [type, loadMyPolls, loadPublicPolls])

	// Auto-refresh polls when dependencies change
	useEffect(() => {
		loadPolls()
	}, [loadPolls])

	return {
		polls,
		loading,
		error,
		refresh: loadPolls
	}
}
