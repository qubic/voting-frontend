import { useLayoutEffect } from 'react'
import { Outlet, useLocation } from 'react-router'

import { Header } from './Header'

export default function AppLayout() {
	const location = useLocation()

	useLayoutEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
	}, [location.pathname])

	return (
		<div className="grid min-h-dvh grid-rows-[auto_1fr_auto]">
			<Header />
			<main className="flex-1 overflow-y-auto p-4 md:p-6">
				<Outlet />
			</main>
		</div>
	)
}
