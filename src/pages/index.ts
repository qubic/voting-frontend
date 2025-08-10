import { lazy } from 'react'

export const CreatePollPageLazy = lazy(() => import('./create-poll/CreatePollPage'))

export { default as HomePage } from './home/HomePage'
export { default as NotFoundPage } from './NotFoundPage'
