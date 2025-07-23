import { configureStore } from '@reduxjs/toolkit'

import { qubicRpcApi } from './apis/qubic-rpc'

export const store = configureStore({
	reducer: {
		[qubicRpcApi.reducerPath]: qubicRpcApi.reducer
	},

	middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(qubicRpcApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
