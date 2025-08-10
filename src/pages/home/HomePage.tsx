import { Plus } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PublicRoutes } from '@/router'

import { EpochInfo, PollsList, PollsOverview } from './components'

export default function HomePage() {
	return (
		<div className="space-y-6">
			<PollsOverview />
			<EpochInfo />

			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold">Polls</h2>
				<Button className="flex items-center gap-2" asChild>
					<Link to={PublicRoutes.CREATE_POLL}>
						<Plus className="h-4 w-4" />
						Create New Poll
					</Link>
				</Button>
			</div>

			<Tabs defaultValue="active" className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="active">Active Polls</TabsTrigger>
					<TabsTrigger value="inactive">Inactive Polls</TabsTrigger>
				</TabsList>

				<TabsContent value="active" className="mt-6">
					<PollsList type="active" />
				</TabsContent>

				<TabsContent value="inactive" className="mt-6">
					<PollsList type="inactive" />
				</TabsContent>
			</Tabs>
		</div>
	)
}
