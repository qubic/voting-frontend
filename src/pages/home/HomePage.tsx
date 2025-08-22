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
					<section className="bg-muted/50 mt-8 space-y-3 rounded-lg p-4">
						<h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
							How It Works
						</h3>
						<div className="space-y-3 text-sm">
							<div className="flex items-start space-x-3">
								<div className="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full"></div>
								<div>
									<p className="text-muted-foreground">
										Voting does not move funds or assets
									</p>
								</div>
							</div>
							<div className="flex items-start space-x-3">
								<div className="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full"></div>
								<div>
									<p className="text-muted-foreground">
										Each vote only burns 100 QU
									</p>
								</div>
							</div>
							<div className="flex items-start space-x-3">
								<div className="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full"></div>
								<div>
									<p className="text-muted-foreground">
										Poll creation burns 10,000,000 QU
									</p>
								</div>
							</div>
							<div className="flex items-start space-x-3">
								<div className="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full"></div>
								<div>
									<p className="text-muted-foreground">
										Voting weight = current balance in wallet (or largest
										balance of allowed asset)
									</p>
								</div>
							</div>
							<div className="space-y-2">
								<p className="font-medium">Polls can be of two types:</p>
								<div className="ml-4 flex items-start space-x-3">
									<div className="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full"></div>
									<div>
										<p className="text-muted-foreground">
											QUBIC Polls → your weight is your QUBIC balance
										</p>
									</div>
								</div>
								<div className="ml-4 flex items-start space-x-3">
									<div className="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full"></div>
									<div>
										<p className="text-muted-foreground">
											Asset Polls → your weight is your largest balance among
											the allowed assets (shares/tokens)
										</p>
									</div>
								</div>
							</div>
							<div className="space-y-2">
								<p className="font-medium">Balance Requirements During Poll</p>
								<div className="ml-4 flex items-start space-x-3">
									<div className="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full"></div>
									<div>
										<p className="text-muted-foreground">
											You must maintain your balance above the minimum amount
											throughout the poll's active period. If your balance
											drops below the minimum amount, your voting power will
											be automatically removed.
										</p>
									</div>
								</div>
								<div className="ml-4 flex items-start space-x-3">
									<div className="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full"></div>
									<div>
										<p className="text-muted-foreground">
											If your balance increases, your voting power remains
											unchanged.
										</p>
									</div>
								</div>
							</div>
						</div>
					</section>
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
