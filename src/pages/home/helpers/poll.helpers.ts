import type { ContractResponse, GetCurrentResultResponse, GetPollInfoResponse } from '@/lib/qubic'
import type { PollWithResults } from '@/types'

// Helper function to fetch poll info and results
export async function fetchPollWithResults(
	pollId: number,
	getPollInfo: (id: number) => Promise<ContractResponse<GetPollInfoResponse>>,
	getCurrentResult: (id: number) => Promise<ContractResponse<GetCurrentResultResponse>>
): Promise<PollWithResults | null> {
	try {
		const pollInfo = await getPollInfo(pollId)
		if (!pollInfo.success || !pollInfo.data || pollInfo.data.found !== 1) {
			return null
		}

		const poll: PollWithResults = {
			...pollInfo.data.poll_info,
			id: pollId,
			poll_link: pollInfo.data.poll_link
		}

		// Fetch poll results
		const pollResults = await getCurrentResult(pollId)
		if (pollResults.success && pollResults.data) {
			poll.results = pollResults.data
		}

		return poll
	} catch (error) {
		console.error(`Failed to fetch poll ${pollId}:`, error)
		return null
	}
}

// Helper function to fetch active polls
export async function fetchActivePolls(
	activePollIds: number[],
	activeCount: number,
	getPollInfo: (id: number) => Promise<ContractResponse<GetPollInfoResponse>>,
	getCurrentResult: (id: number) => Promise<ContractResponse<GetCurrentResultResponse>>
): Promise<PollWithResults[]> {
	const activePolls: PollWithResults[] = []

	for (let i = 0; i < activeCount; i++) {
		const pollId = activePollIds[i]
		const poll = await fetchPollWithResults(pollId, getPollInfo, getCurrentResult)
		if (poll) {
			activePolls.push(poll)
		}
	}

	return activePolls
}

// Helper function to fetch recent inactive polls
export async function fetchInactivePolls(
	currentPollId: number,
	activePollIds: number[],
	maxToShow: number,
	getPollInfo: (id: number) => Promise<ContractResponse<GetPollInfoResponse>>,
	getCurrentResult: (id: number) => Promise<ContractResponse<GetCurrentResultResponse>>
): Promise<PollWithResults[]> {
	const inactivePolls: PollWithResults[] = []
	const totalPolls = currentPollId

	for (let i = Math.max(0, totalPolls - maxToShow - 1); i < totalPolls; i++) {
		// Skip if this poll is already in active polls
		if (activePollIds.includes(i)) continue

		const poll = await fetchPollWithResults(i, getPollInfo, getCurrentResult)
		if (poll) {
			inactivePolls.push(poll)
		}
	}

	return inactivePolls
}
