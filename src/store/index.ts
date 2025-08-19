import { configureStore } from '@reduxjs/toolkit'

import { qubicRpcApi } from './apis/qubic-rpc'
import { modalSlice } from './slices/modal.slice'
import { transactionsSlice } from './slices/transactions.slice'

export const store = configureStore({
	reducer: {
		// Slices reducers
		[modalSlice.name]: modalSlice.reducer,
		[transactionsSlice.name]: transactionsSlice.reducer,
		// API reducers
		[qubicRpcApi.reducerPath]: qubicRpcApi.reducer
	},

	middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(qubicRpcApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
