import { lazy } from 'react'

export const CreatePollPageLazy = lazy(() => import('./create-poll/CreatePollPage'))

export { CLIVotingPage } from './cli-voting'
export { default as HomePage } from './home/HomePage'
export { default as NotFoundPage } from './NotFoundPage'

