import { ArrowLeft, Copy, ExternalLink, Terminal } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { Button } from '@/components/buttons'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function CLIVotingPage() {
	const [copiedCommand, setCopiedCommand] = useState<string | null>(null)

	const copyToClipboard = async (text: string, commandName: string) => {
		try {
			await navigator.clipboard.writeText(text)
			setCopiedCommand(commandName)
			toast.success(`${commandName} copied to clipboard!`)
			setTimeout(() => setCopiedCommand(null), 2000)
		} catch (err) {
			toast.error('Failed to copy to clipboard')
		}
	}

	const cliCommands = [
		{
			name: 'Vote in a Poll',
			command: 'qubic-cli -qutilvote <POLL_ID> <AMOUNT> <CHOSEN_OPTION>',
			description: 'Vote in a poll using the CLI',
			parameters: [
				'<POLL_ID> - The poll\'s ID (number)',
				'<AMOUNT> - The vote amount (number of shares)',
				'<CHOSEN_OPTION> - Selected option (0-63)'
			],
			example: 'qubic-cli -qutilvote 10 1000 1'
		},
		{
			name: 'Get Poll Results',
			command: 'qubic-cli -qutilgetcurrentresult <POLL_ID>',
			description: 'Get the current results of a poll',
			parameters: [
				'<POLL_ID> - The poll\'s ID (number)'
			],
			example: 'qubic-cli -qutilgetcurrentresult 10'
		},
		{
			name: 'Get Poll Information',
			command: 'qubic-cli -qutilgetpollinfo <POLL_ID>',
			description: 'Get detailed information about a specific poll',
			parameters: [
				'<POLL_ID> - The poll\'s ID (number)'
			],
			example: 'qubic-cli -qutilgetpollinfo 10'
		},
		{
			name: 'List Active Polls',
			command: 'qubic-cli -qutilgetcurrentpollid',
			description: 'Get current poll ID and list of active polls',
			parameters: [],
			example: 'qubic-cli -qutilgetcurrentpollid'
		},
		{
			name: 'Get Polls by Creator',
			command: 'qubic-cli -qutilgetpollsbycreator <CREATOR_ADDRESS>',
			description: 'Get polls created by a specific user',
			parameters: [
				'<CREATOR_ADDRESS> - The creator\'s identity address'
			],
			example: 'qubic-cli -qutilgetpollsbycreator ABCDEF...'
		},
		{
			name: 'Create a Poll',
			command: 'qubic-cli -qutilcreatepoll <POLL_NAME> <POLL_TYPE> <MIN_AMOUNT> <GITHUB_LINK> <ASSET_NAMES> <ASSET_ISSUERS>',
			description: 'Create a new poll (advanced users)',
			parameters: [
				'<POLL_NAME> - Poll name (32 bytes max)',
				'<POLL_TYPE> - 1 for QUBIC, 2 for Asset',
				'<MIN_AMOUNT> - Minimum vote amount',
				'<GITHUB_LINK> - GitHub link (256 bytes max)',
				'<ASSET_NAMES> - Comma-separated asset names (for Asset polls)',
				'<ASSET_ISSUERS> - Comma-separated asset issuers (for Asset polls)'
			],
			example: 'qubic-cli -qutilcreatepoll "My Poll" 1 1000 "https://github.com/user/repo" "TOKEN1,TOKEN2" "ISSUER1,ISSUER2"'
		}
	]

	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			{/* Header */}
			<div className="mb-8">
				<Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
					<ArrowLeft className="h-4 w-4" />
					Back to Home
				</Link>
				
				<div className="flex items-center gap-3 mb-4">
					<Terminal className="h-8 w-8 text-blue-600" />
					<h1 className="text-3xl font-bold">CLI Voting Instructions</h1>
					<Badge variant="secondary">Qubic CLI</Badge>
				</div>
				
				<p className="text-muted-foreground text-lg">
					Learn how to vote and interact with polls using the Qubic CLI tool.
				</p>
			</div>

			{/* Prerequisites */}
			<Card className="mb-8">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Terminal className="h-5 w-5" />
						Prerequisites
					</CardTitle>
					<CardDescription>
						Before using CLI commands, make sure you have:
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex items-start gap-3">
						<div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
						<div>
							<p className="font-medium">Qubic CLI installed</p>
							<p className="text-sm text-muted-foreground">
								Download from the{' '}
								<a 
									href="https://github.com/icyblob/qubic-cli/tree/gvote" 
									target="_blank" 
									rel="noopener noreferrer"
									className="text-blue-600 hover:underline inline-flex items-center gap-1"
								>
									gvote branch
									<ExternalLink className="h-3 w-3" />
								</a>
							</p>
						</div>
					</div>
					<div className="flex items-start gap-3">
						<div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
						<div>
							<p className="font-medium">Valid private key</p>
							<p className="text-sm text-muted-foreground">
								Your Qubic wallet private key for authentication
							</p>
						</div>
					</div>
					<div className="flex items-start gap-3">
						<div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
						<div>
							<p className="font-medium">Node connection</p>
							<p className="text-sm text-muted-foreground">
								Valid Qubic node IP address and port
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Commands */}
			<div className="space-y-6">
				<h2 className="text-2xl font-semibold">Available Commands</h2>
				
				{cliCommands.map((cmd, index) => (
					<Card key={index}>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="text-lg">{cmd.name}</CardTitle>
									<CardDescription>{cmd.description}</CardDescription>
								</div>
								<Button
									variant="outlined"
									size="sm"
									onClick={() => copyToClipboard(cmd.command, cmd.name)}
									className="flex items-center gap-2"
								>
									<Copy className="h-4 w-4" />
									{copiedCommand === cmd.name ? 'Copied!' : 'Copy'}
								</Button>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Command */}
							<div className="bg-muted rounded-lg p-4">
								<code className="text-sm font-mono break-all">{cmd.command}</code>
							</div>
							
							{/* Parameters */}
							{cmd.parameters.length > 0 && (
								<div>
									<h4 className="font-medium mb-2">Parameters:</h4>
									<ul className="space-y-1">
										{cmd.parameters.map((param, paramIndex) => (
											<li key={paramIndex} className="text-sm text-muted-foreground">
												• {param}
											</li>
										))}
									</ul>
								</div>
							)}
							
							{/* Example */}
							<div>
								<h4 className="font-medium mb-2">Example:</h4>
								<div className="bg-muted rounded-lg p-3">
									<code className="text-sm font-mono">{cmd.example}</code>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Tips */}
			<Card className="mt-8">
				<CardHeader>
					<CardTitle>💡 Tips</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex items-start gap-3">
						<div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
						<p className="text-sm">
							<strong>Binary Polls:</strong> For Yes/No polls, use option 0 for "No" and option 1 for "Yes"
						</p>
					</div>
					<div className="flex items-start gap-3">
						<div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
						<p className="text-sm">
							<strong>Vote Amount:</strong> This is the number of shares you're voting with, not a transaction amount
						</p>
					</div>
					<div className="flex items-start gap-3">
						<div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
						<p className="text-sm">
							<strong>Poll ID:</strong> Use the "List Active Polls" command to find current poll IDs
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
