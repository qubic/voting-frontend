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
			<main className="container mx-auto flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-16">
				<Outlet />
			</main>
		</div>
	)
}
