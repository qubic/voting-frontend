import { useCallback } from 'react'

import { useWalletConnect } from '@/hooks'
import { LogFeature, makeLog } from '@/lib/logger'
import { decodeContractResponse, encodeParams, QUTIL_ABI } from '@/lib/qubic'
import { QUTIL_CONFIG, QUTIL_FUNCTIONS, QUTIL_PROCEDURES } from '@/lib/qubic/constants'
import {
	type CreatePollFormData,
	type GetCurrentPollIdResponse,
	GetCurrentPollIdResponseSchema,
	type GetCurrentResultResponse,
	GetCurrentResultResponseSchema,
	type GetPollInfoResponse,
	GetPollInfoResponseSchema,
	type GetPollsByCreatorResponse,
	GetPollsByCreatorResponseSchema,
	type VoteFormData
} from '@/lib/qubic/schemas'
import type { ContractResponse } from '@/lib/qubic/types'
import { validateContractResponse } from '@/lib/qubic/validators'
import {
	type QuerySmartContractArgs,
	useLazyGetTickInfoQuery,
	useQuerySmartContractMutation
} from '@/store/apis/qubic-rpc'

import { useTxMonitor } from './useTxMonitor'

const log = makeLog(LogFeature.QUTIL_CONTRACT_HOOK)

export interface UseQUtilContractReturn {
	// Query methods
	getPollsByCreator: (
		creatorAddress: string
	) => Promise<ContractResponse<GetPollsByCreatorResponse>>
	getCurrentPollId: () => Promise<ContractResponse<GetCurrentPollIdResponse>>
	getPollInfo: (pollId: number) => Promise<ContractResponse<GetPollInfoResponse>>
	getCurrentResult: (pollId: number) => Promise<ContractResponse<GetCurrentResultResponse>>
	// State-changing methods (procedures)
	createPoll: (
		data: CreatePollFormData
	) => Promise<{ success: boolean; tick?: number; transactionId?: string }>
	castVote: (
		data: VoteFormData
	) => Promise<{ success: boolean; tick?: number; transactionId?: string }>
	cancelPoll: (
		pollId: number
	) => Promise<{ success: boolean; tick?: number; transactionId?: string }>
}

export const useQUtilContract = (): UseQUtilContractReturn => {
	const { walletClient, selectedAccount } = useWalletConnect()
	const [getTickInfo] = useLazyGetTickInfoQuery()
	const [querySmartContractMutation] = useQuerySmartContractMutation()
	const { addPendingTransaction } = useTxMonitor()

	/* -----------------------------------
   		Helpers
	----------------------------------- */

	const getSendTick = useCallback(async () => {
		const TICK_MARGIN = 10
		const tickInfo = await getTickInfo()
		if (!tickInfo.data) {
			throw new Error('Failed to get tick info')
		}
		return tickInfo.data.tick + TICK_MARGIN
	}, [getTickInfo])

	/* -----------------------------------
   		Query methods
	----------------------------------- */

	const getPollsByCreator = useCallback(
		async (creatorAddress: string) => {
			const params = { creator: creatorAddress }
			log('getPollsByCreator - params', { params })

			const { encodedParams, inputSize } = encodeParams(
				params,
				QUTIL_ABI.functions.getPollsByCreator.inputs
			)
			log('getPollsByCreator - encodedParams', { encodedParams })

			const payload: QuerySmartContractArgs = {
				contractIndex: QUTIL_CONFIG.CONTRACT_INDEX,
				inputType: QUTIL_FUNCTIONS.GET_POLLS_BY_CREATOR,
				inputSize,
				requestData: encodedParams
			}

			log('getPollsByCreator - querySmartContractMutation args', payload)

			const result = await querySmartContractMutation(payload)

			log('getPollsByCreator - result', { result })

			const decoded = await decodeContractResponse(
				result.data?.responseData || '',
				QUTIL_ABI.functions.getPollsByCreator.outputs
			)

			log('getPollsByCreator - decoded', { decoded })

			const validationResult = validateContractResponse(
				decoded,
				GetPollsByCreatorResponseSchema,
				'getPollsByCreator'
			)

			return validationResult
		},
		[querySmartContractMutation]
	)

	const getCurrentPollId = useCallback(async () => {
		const result = await querySmartContractMutation({
			contractIndex: QUTIL_CONFIG.CONTRACT_INDEX,
			inputType: QUTIL_FUNCTIONS.GET_CURRENT_POLL_ID,
			inputSize: 0,
			requestData: ''
		})

		log('getCurrentPollId - result', { result })

		const decoded = await decodeContractResponse(
			result.data?.responseData || '',
			QUTIL_ABI.functions.getCurrentPollId.outputs
		)

		log('getCurrentPollId - decoded', { decoded })

		const validationResult = validateContractResponse(
			decoded,
			GetCurrentPollIdResponseSchema,
			'getCurrentPollId'
		)

		return validationResult
	}, [querySmartContractMutation])

	const getPollInfo = useCallback(
		async (pollId: number) => {
			const params = { poll_id: pollId }

			const { encodedParams, inputSize } = encodeParams(
				params,
				QUTIL_ABI.functions.getPollInfo.inputs
			)

			const result = await querySmartContractMutation({
				contractIndex: QUTIL_CONFIG.CONTRACT_INDEX,
				inputType: QUTIL_FUNCTIONS.GET_POLL_INFO,
				inputSize,
				requestData: encodedParams
			})

			log('getPollInfo - result', { result })

			const decoded = await decodeContractResponse(
				result.data?.responseData || '',
				QUTIL_ABI.functions.getPollInfo.outputs
			)

			log('getPollInfo - decoded', { decoded })

			const validationResult = validateContractResponse(
				decoded,
				GetPollInfoResponseSchema,
				'getPollInfo'
			)

			return validationResult
		},
		[querySmartContractMutation]
	)

	const getCurrentResult = useCallback(
		async (pollId: number) => {
			const params = { poll_id: pollId }

			const { encodedParams, inputSize } = encodeParams(
				params,
				QUTIL_ABI.functions.getCurrentResult.inputs
			)

			const result = await querySmartContractMutation({
				contractIndex: QUTIL_CONFIG.CONTRACT_INDEX,
				inputType: QUTIL_FUNCTIONS.GET_CURRENT_RESULT,
				inputSize,
				requestData: encodedParams
			})

			log('getCurrentResult - result', { result })

			const decoded = await decodeContractResponse(
				result.data?.responseData || '',
				QUTIL_ABI.functions.getCurrentResult.outputs
			)

			log('getCurrentResult - decoded', { decoded })

			const validationResult = validateContractResponse(
				decoded,
				GetCurrentResultResponseSchema,
				'getCurrentResult'
			)

			return validationResult
		},
		[querySmartContractMutation]
	)

	/* -----------------------------------
   		Procedure methods (state-changing methods)
	----------------------------------- */

	const createPoll = useCallback(
		async (data: CreatePollFormData) => {
			if (!walletClient || !selectedAccount) {
				throw new Error('Wallet not connected')
			}

			const futureTick = await getSendTick()

			log({ formData: data, futureTick })

			const { encodedParams } = encodeParams(data, QUTIL_ABI.functions.createPoll.inputs)

			log({ encodedPayload: encodedParams })

			const sent = await walletClient.sendTransaction(
				selectedAccount.address,
				QUTIL_CONFIG.ADDRESS,
				QUTIL_CONFIG.POLL_CREATION_FEE,
				futureTick,
				QUTIL_PROCEDURES.CREATE_POLL,
				encodedParams
			)

			log({ sent })

			// Add pending transaction to monitor
			addPendingTransaction({
				type: 'createPoll',
				targetTick: sent.tick,
				txHash: sent.transactionId,
				userAddress: selectedAccount.address,
				data
			})

			return {
				success: true,
				tick: sent.tick,
				transactionId: sent.transactionId
			}
		},
		[walletClient, selectedAccount, getSendTick, addPendingTransaction]
	)

	const castVote = useCallback(
		async (data: VoteFormData) => {
			if (!walletClient || !selectedAccount) {
				throw new Error('Wallet not connected')
			}

			const futureTick = await getSendTick()

			const { encodedParams } = encodeParams(data, QUTIL_ABI.functions.vote.inputs)

			const sent = await walletClient.sendTransaction(
				selectedAccount.address,
				QUTIL_CONFIG.ADDRESS,
				QUTIL_CONFIG.VOTE_FEE,
				futureTick,
				QUTIL_PROCEDURES.VOTE,
				encodedParams
			)
			log('castVote - result', { sent })

			addPendingTransaction({
				type: 'vote',
				targetTick: sent.tick,
				txHash: sent.transactionId,
				userAddress: selectedAccount.address,
				data
			})

			return {
				success: true,
				tick: sent.tick,
				transactionId: sent.transactionId
			}
		},
		[walletClient, selectedAccount, getSendTick, addPendingTransaction]
	)

	const cancelPoll = useCallback(
		async (pollId: number) => {
			if (!walletClient || !selectedAccount) {
				throw new Error('Wallet not connected')
			}

			const params = { poll_id: pollId }
			log('cancelPoll - params', { params })

			const { encodedParams } = encodeParams(params, QUTIL_ABI.functions.cancelPoll.inputs)
			log('cancelPoll - encodedParams', { encodedParams })

			const futureTick = await getSendTick()

			const sent = await walletClient.sendTransaction(
				selectedAccount.address,
				QUTIL_CONFIG.ADDRESS,
				QUTIL_CONFIG.POLL_CANCELLATION_FEE,
				futureTick,
				QUTIL_PROCEDURES.CANCEL_POLL,
				encodedParams
			)

			log('cancelPoll - result', { sent })

			// Add pending transaction to monitor
			addPendingTransaction({
				type: 'cancelPoll',
				targetTick: sent.tick,
				txHash: sent.transactionId,
				userAddress: selectedAccount.address,
				data: params
			})

			return {
				success: true,
				tick: sent.tick,
				transactionId: sent.transactionId
			}
		},
		[walletClient, selectedAccount, getSendTick, addPendingTransaction]
	)

	return {
		// Query methods
		getPollsByCreator,
		getCurrentPollId,
		getPollInfo,
		getCurrentResult,
		// State-changing methods (procedures)
		createPoll,
		castVote,
		cancelPoll
	}
}
