import { Plus } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PublicRoutes } from '@/router'

import { EpochInfo, PollsList, PollsOverview, TransactionHistory } from './components'

export default function HomePage() {
	return (
		<div className="flex flex-col gap-8 py-10 xl:flex-row">
			<div className="w-full xl:w-2/5 xl:flex-shrink-0">
				<div className="space-y-4">
					<h1 className="text-4xl leading-tight">
						Qubic <span className="text-primary">Community</span> Voting System
					</h1>
					<p className="text-muted-foreground text-lg leading-relaxed">
						Create polls, cast votes, and participate in community governance on the
						Qubic network.
					</p>
				</div>
			</div>

			<div className="min-w-0 flex-1">
				<div className="space-y-6">
					<PollsOverview />
					<EpochInfo />

					<div className="flex items-center justify-between">
						<h2 className="text-2xl font-bold">Polls</h2>
						<Button className="ml-4 w-fit items-center gap-2" asChild>
							<Link to={PublicRoutes.CREATE_POLL}>
								<Plus className="h-4 w-4" />
								Create New Poll
							</Link>
						</Button>
					</div>

					<Tabs defaultValue="active" className="flex-1">
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="active">Active Polls</TabsTrigger>
							<TabsTrigger value="inactive">Inactive Polls</TabsTrigger>
							<TabsTrigger value="my-polls">My Polls</TabsTrigger>
							<TabsTrigger value="history">History</TabsTrigger>
						</TabsList>
						<TabsContent value="active" className="mt-6">
							<PollsList type="active" />
						</TabsContent>
						<TabsContent value="inactive" className="mt-6">
							<PollsList type="inactive" />
						</TabsContent>
						<TabsContent value="my-polls" className="mt-6">
							<PollsList type="my-polls" />
						</TabsContent>
						<TabsContent value="history" className="mt-6">
							<TransactionHistory />
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	)
}
