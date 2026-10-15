import ArrowRightIcon from '../icons/ArrowRight'
import Button from '../ui/Button'
import Footer from '../ui/Footer'
import Logo from '../ui/Logo'

const STEPS = ['capture os slides', 'a ia lê os títulos das aulas', 'estude em blocos de foco']

export default function StartScreen({ onStart }: { onStart: () => void }) {
	return (
		<>
			<div
				aria-hidden
				className="pointer-events-none fixed inset-x-0 top-0 h-[70dvh] bg-[radial-gradient(ellipse_60%_55%_at_50%_0%,var(--accent-soft),transparent_70%)] opacity-70"
			/>

			<main className="relative flex-1 flex flex-col items-center justify-center text-center pb-8">
				<Logo className="text-6xl md:text-8xl animate-rise" />

				<p className="max-w-[26ch] md:max-w-[32ch] mt-8 text-lg md:text-xl leading-relaxed text-ink-muted animate-rise stagger-1">
					transforme capturas de tela das suas aulas em um plano de estudo <span className="text-ink font-medium">pomodoro</span>,
					pronto pra começar.
				</p>

				<div className="mt-12 animate-rise stagger-2">
					<Button onClick={onStart} className="group">
						criar pomodoro
						<span className="transition-transform duration-300 ease-spring group-hover:translate-x-0.5">
							<ArrowRightIcon />
						</span>
					</Button>
				</div>

				<ol className="mt-20 flex flex-col md:flex-row gap-3 md:gap-8 text-sm text-ink-faint animate-rise stagger-3">
					{STEPS.map((step, i) => (
						<li key={step} className="flex items-baseline gap-2">
							<span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, '0')}</span>
							{step}
						</li>
					))}
				</ol>
			</main>

			<Footer />
		</>
	)
}
