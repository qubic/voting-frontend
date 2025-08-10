import { configureStore } from '@reduxjs/toolkit'

import { qubicRpcApi } from './apis/qubic-rpc'
import modalReducer from './slices/modal.slice'

export const store = configureStore({
	reducer: {
		modal: modalReducer,
		[qubicRpcApi.reducerPath]: qubicRpcApi.reducer
	},

	middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(qubicRpcApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
