import { useCallback } from 'react'

import { LogFeature, makeLog } from '@/lib/logger'
import { decodeContractResponse, encodeParams, QUTIL_ABI } from '@/lib/qubic'
import { QUTIL_CONFIG, QUTIL_FUNCTIONS } from '@/lib/qubic/constants'
import {
	type GetCurrentPollIdResponse,
	GetCurrentPollIdResponseSchema,
	type GetCurrentResultResponse,
	GetCurrentResultResponseSchema,
	type GetPollInfoResponse,
	GetPollInfoResponseSchema,
	type GetPollsByCreatorResponse,
	GetPollsByCreatorResponseSchema
} from '@/lib/qubic/schemas'
import type { ContractResponse } from '@/lib/qubic/types'
import { validateContractResponse } from '@/lib/qubic/validators'
import { type QuerySmartContractArgs, useQuerySmartContractMutation } from '@/store/apis/qubic-rpc'

const log = makeLog(LogFeature.QUTIL_CONTRACT_HOOK)

export interface UseQUtilContractReturn {
	// Query methods
	getPollsByCreator: (
		creatorAddress: string
	) => Promise<ContractResponse<GetPollsByCreatorResponse>>
	getCurrentPollId: () => Promise<ContractResponse<GetCurrentPollIdResponse>>
	getPollInfo: (pollId: number) => Promise<ContractResponse<GetPollInfoResponse>>
	getCurrentResult: (pollId: number) => Promise<ContractResponse<GetCurrentResultResponse>>
}

export const useQUtilContract = (): UseQUtilContractReturn => {
	const [querySmartContractMutation] = useQuerySmartContractMutation()

	const getPollsByCreator = useCallback(
		async (creatorAddress: string) => {
			const params = { creator: creatorAddress }
			log('getPollsByCreator - params', { params })

			const { encodedParams, inputSize } = encodeParams(
				params,
				QUTIL_ABI.getPollsByCreator.inputs
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

			const decoded = decodeContractResponse(
				result.data?.responseData || '',
				QUTIL_ABI.getPollsByCreator.outputs
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

		const decoded = decodeContractResponse(
			result.data?.responseData || '',
			QUTIL_ABI.getCurrentPollId.outputs
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

			const { encodedParams, inputSize } = encodeParams(params, QUTIL_ABI.getPollInfo.inputs)

			const result = await querySmartContractMutation({
				contractIndex: QUTIL_CONFIG.CONTRACT_INDEX,
				inputType: QUTIL_FUNCTIONS.GET_POLL_INFO,
				inputSize,
				requestData: encodedParams
			})

			log('getPollInfo - result', { result })

			const decoded = decodeContractResponse(
				result.data?.responseData || '',
				QUTIL_ABI.getPollInfo.outputs
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
				QUTIL_ABI.getCurrentResult.inputs
			)

			const result = await querySmartContractMutation({
				contractIndex: QUTIL_CONFIG.CONTRACT_INDEX,
				inputType: QUTIL_FUNCTIONS.GET_CURRENT_RESULT,
				inputSize,
				requestData: encodedParams
			})

			log('getCurrentResult - result', { result })

			const decoded = decodeContractResponse(
				result.data?.responseData || '',
				QUTIL_ABI.getCurrentResult.outputs
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

	return {
		getPollsByCreator,
		getCurrentPollId,
		getPollInfo,
		getCurrentResult
	}
}
