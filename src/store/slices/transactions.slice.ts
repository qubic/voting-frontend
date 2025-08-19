import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { LOCAL_STORAGE_KEYS } from '@/constants/local-storage-keys'
import type { RootState } from '@/store'
import type { PendingTransaction, TransactionStatus } from '@/types'

interface TransactionState {
	pendingTransactions: PendingTransaction[]
	transactionHistory: PendingTransaction[]
}

const initialState: TransactionState = {
	pendingTransactions: [],
	transactionHistory: []
}

/* --------------------------
   Local Storage helpers
--------------------------- */
// Helper function to save all transactions to localStorage
const saveAllTransactionsToStorage = (state: TransactionState) => {
	const allTransactions = [...state.pendingTransactions, ...state.transactionHistory]
	localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTION_HISTORY, JSON.stringify(allTransactions))
}

// Helper function to load transactions from localStorage
export const loadTransactionsFromStorage = (): TransactionState => {
	try {
		const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.TRANSACTION_HISTORY)
		if (!stored) return initialState

		const allTransactions: PendingTransaction[] = JSON.parse(stored)
		const pending = allTransactions.filter((tx) => tx.status === 'pending')
		const completed = allTransactions.filter((tx) => tx.status !== 'pending')

		return {
			pendingTransactions: pending,
			transactionHistory: completed
		}
	} catch (error) {
		console.error('Failed to load transactions from localStorage:', error)
		localStorage.removeItem(LOCAL_STORAGE_KEYS.TRANSACTION_HISTORY)
		return initialState
	}
}

export const transactionsSlice = createSlice({
	name: 'transactions',
	initialState,
	reducers: {
		initializeFromStorage: (state) => {
			const loadedState = loadTransactionsFromStorage()
			state.pendingTransactions = loadedState.pendingTransactions
			state.transactionHistory = loadedState.transactionHistory
		},
		addPendingTransaction: (state, action: PayloadAction<PendingTransaction>) => {
			state.pendingTransactions.push(action.payload)
			// Save to localStorage after state update
			saveAllTransactionsToStorage(state)
		},
		updateTransactionStatus: (
			state,
			action: PayloadAction<{
				txHash: string
				status: TransactionStatus
				errorMessage?: string
			}>
		) => {
			const { txHash, status, errorMessage } = action.payload

			// Update in pending transactions
			const pendingIndex = state.pendingTransactions.findIndex((tx) => tx.txHash === txHash)
			if (pendingIndex >= 0) {
				state.pendingTransactions[pendingIndex].status = status
				state.pendingTransactions[pendingIndex].errorMessage = errorMessage

				// If transaction is complete, move it to history
				if (status === 'success' || status === 'failed') {
					const completedTx = state.pendingTransactions[pendingIndex]
					state.transactionHistory.push(completedTx)
					state.pendingTransactions.splice(pendingIndex, 1)
				}
			}

			// Update in history if it exists there
			const historyIndex = state.transactionHistory.findIndex((tx) => tx.txHash === txHash)
			if (historyIndex >= 0) {
				state.transactionHistory[historyIndex].status = status
				state.transactionHistory[historyIndex].errorMessage = errorMessage
			}

			// Save to localStorage after state update
			saveAllTransactionsToStorage(state)
		},
		removeTransaction: (state, action: PayloadAction<string>) => {
			const txHash = action.payload
			state.pendingTransactions = state.pendingTransactions.filter(
				(tx) => tx.txHash !== txHash
			)
			state.transactionHistory = state.transactionHistory.filter((tx) => tx.txHash !== txHash)
			// Save to localStorage after state update
			saveAllTransactionsToStorage(state)
		},
		setTransactionHistory: (state, action: PayloadAction<PendingTransaction[]>) => {
			state.transactionHistory = action.payload
			// Save to localStorage after state update
			saveAllTransactionsToStorage(state)
		},
		setPendingTransactions: (state, action: PayloadAction<PendingTransaction[]>) => {
			state.pendingTransactions = action.payload
			// Save to localStorage after state update
			saveAllTransactionsToStorage(state)
		}
	}
})

export const {
	initializeFromStorage,
	addPendingTransaction,
	updateTransactionStatus,
	removeTransaction,
	setTransactionHistory,
	setPendingTransactions
} = transactionsSlice.actions

export default transactionsSlice.reducer

export const selectTransactions = (state: RootState) => state.transactions
