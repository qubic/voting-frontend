'use client'

import { AlertCircleIcon, Info } from 'lucide-react'

import { Badge } from '@/components/ui'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger
} from '@/components/ui/accordion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { QUTIL_CONFIG } from '@/lib/qubic'
import { cn } from '@/lib/utils'

interface VotingInfoProps {
	className?: string
}

export default function VotingInfo({ className }: VotingInfoProps) {
	return (
		<Accordion
			type="single"
			collapsible
			className={cn('w-full rounded-lg border border-dashed px-3', className)}
		>
			<AccordionItem value="voting-info">
				<AccordionTrigger className="py-3 text-left hover:no-underline">
					<div className="text-muted-foreground flex items-center gap-2">
						<Info className="h-4 w-4" />
						<span className="text-sm font-medium">How Voting Works</span>
					</div>
				</AccordionTrigger>
				<AccordionContent className="px-3 pt-0">
					<div className="text-muted-foreground space-y-4 text-sm">
						<div className="space-y-3">
							<h4 className="text-foreground font-medium">Voting Power & Amount</h4>
							<p>
								The amount you enter represents your voting power. It must be equal
								to or greater than the minimum amount required for the poll, but
								cannot exceed your current balance.
							</p>
							<Alert variant="info" className="flex">
								<AlertCircleIcon className="h-4 w-4" />
								<AlertTitle>Important:</AlertTitle>
								<AlertDescription>
									You do not pay or deposit this amount - it's symbolic and
									represents your voting power.
								</AlertDescription>
							</Alert>
						</div>

						<div className="space-y-3">
							<h4 className="text-foreground font-medium">
								Balance Requirements During Poll
							</h4>
							<p>
								You must maintain your balance above the minimum amount throughout
								the poll's active period. If your balance drops below the minimum
								amount, your voting power will be automatically removed.
							</p>
							<p>If your balance increases, your voting power remains unchanged.</p>
						</div>

						<div className="space-y-3">
							<h4 className="text-foreground font-medium">Example Scenario</h4>
							<div className="bg-muted rounded-lg p-3 text-xs">
								<p className="mb-2">
									<strong>Poll Requirements:</strong> Minimum 1,000 QUs per vote
								</p>
								<ul className="space-y-1">
									<li>• Voter A: 20k QUs balance, votes with 10k QUs</li>
									<li>• Voter B: 1k QUs balance, votes with 1k QUs</li>
									<li>• Voter C: 5k QUs balance, votes with 3k QUs</li>
								</ul>
								<p className="mt-2">
									<strong>During Poll:</strong>
								</p>
								<ul className="space-y-1">
									<li>
										• Voter A's balance drops to 500 QUs → Removed from poll
									</li>
									<li>• Voter B's balance stays at 1k QUs → No change</li>
									<li>• Voter C's balance increases to 10k QUs → No change</li>
								</ul>
							</div>
						</div>

						<div className="space-y-3">
							<h4 className="text-foreground font-medium">Fees</h4>
							<p>
								Voting cost an small fee of{' '}
								<Badge
									variant="outline"
									className="bg-warning/10 text-warning border-warning/20 ml-1"
								>
									{QUTIL_CONFIG.VOTE_FEE} QUBIC
								</Badge>
							</p>
						</div>
					</div>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	)
}
