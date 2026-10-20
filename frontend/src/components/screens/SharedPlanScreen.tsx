import { useEffect, useMemo, useState } from 'react'

import { Client } from '../../api'
import type { SharedPlan } from '../../types'
import { generateSessionsData } from '../../utils'
import { daysUntil, describeApiError, formatDays, SHARE_TTL_DAYS } from '../../utils/share'
import ArrowRightIcon from '../icons/ArrowRight'
import LinkIcon from '../icons/Link'
import LinkOffIcon from '../icons/LinkOff'
import Loading from '../icons/Loading'
import Button from '../ui/Button'
import Footer from '../ui/Footer'
import Header from '../ui/Header'
import LessonSummary from '../ui/LessonSummary'
import SessionPreview from '../ui/SessionPreview'

type LoadState =
	| { status: 'loading' }
	| { status: 'ready'; plan: SharedPlan; expiresInDays: number }
	| { status: 'expired' }
	| { status: 'error'; message: string }

export default function SharedPlanScreen({
	planId,
	onStart,
	onAdjust,
	onCreate,
	onReset,
}: {
	planId: string
	onStart: (plan: SharedPlan) => void
	onAdjust: (plan: SharedPlan) => void
	onCreate: () => void
	onReset: () => void
}) {
	const [state, setState] = useState<LoadState>({ status: 'loading' })
	const [attempt, setAttempt] = useState(0)

	useEffect(() => {
		let cancelled = false

		Client.plans({ id: planId })
			.get()
			.then(({ data, error }) => {
				if (cancelled) return
				if (error) {
					setState(
						error.status === 404
							? { status: 'expired' }
							: { status: 'error', message: describeApiError(error, 'não foi possível abrir o plano.') },
					)
				} else {
					setState({ status: 'ready', plan: data, expiresInDays: daysUntil(data.expiresAt) })
				}
			})
			.catch(() => {
				if (!cancelled) setState({ status: 'error', message: 'não foi possível abrir o plano. verifique sua conexão.' })
			})

		return () => {
			cancelled = true
		}
	}, [planId, attempt])

	const handleRetry = () => {
		setState({ status: 'loading' })
		setAttempt(prev => prev + 1)
	}

	if (state.status === 'loading') {
		return (
			<>
				<Header onReset={onReset} />
				<main className="flex-1 flex items-center justify-center gap-3 text-ink-muted" aria-busy>
					<Loading />
					abrindo plano compartilhado
				</main>
			</>
		)
	}

	if (state.status !== 'ready') {
		const expired = state.status === 'expired'

		return (
			<>
				<Header onReset={onReset} />
				<main className="flex-1 flex flex-col items-center justify-center text-center pb-16">
					<span className="size-14 rounded-[18px] flex items-center justify-center bg-sunken text-ink-muted animate-rise">
						<LinkOffIcon />
					</span>
					<h2 className="mt-8 text-4xl md:text-5xl font-semibold tracking-[-0.035em] animate-rise stagger-1">
						{expired ? 'este link expirou.' : 'não deu pra abrir este plano.'}
					</h2>
					<p className="mt-4 text-ink-muted max-w-[38ch] animate-rise stagger-2">
						{expired ? (
							<>
								planos compartilhados ficam disponíveis por{' '}
								<span className="font-mono text-ink">{formatDays(SHARE_TTL_DAYS)}</span>. peça um link novo a quem te
								enviou, ou monte o seu a partir das capturas.
							</>
						) : (
							state.message
						)}
					</p>
					<div className="mt-10 flex flex-col sm:flex-row gap-3 animate-rise stagger-3">
						{!expired && <Button onClick={handleRetry}>tentar de novo</Button>}
						<Button variant={expired ? 'primary' : 'secondary'} onClick={onCreate} className="group">
							criar pomodoro
							{expired && (
								<span className="transition-transform duration-300 ease-spring group-hover:translate-x-0.5">
									<ArrowRightIcon />
								</span>
							)}
						</Button>
					</div>
				</main>
				<Footer />
			</>
		)
	}

	return <SharedPlanReady {...state} onStart={onStart} onAdjust={onAdjust} onReset={onReset} />
}

function SharedPlanReady({
	plan,
	expiresInDays,
	onStart,
	onAdjust,
	onReset,
}: {
	plan: SharedPlan
	expiresInDays: number
	onStart: (plan: SharedPlan) => void
	onAdjust: (plan: SharedPlan) => void
	onReset: () => void
}) {
	const sessions = useMemo(() => generateSessionsData(plan), [plan])

	return (
		<>
			<div
				aria-hidden
				className="pointer-events-none fixed inset-x-0 top-0 h-[60dvh] bg-[radial-gradient(ellipse_60%_55%_at_50%_0%,var(--accent-soft),transparent_70%)] opacity-50"
			/>

			<Header onReset={onReset}>
				<span className="relative inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-surface ring-1 ring-line text-[0.8125rem] text-ink-muted">
					<LinkIcon size={14} />
					plano compartilhado
				</span>
			</Header>

			<main className="relative flex-1 grid md:grid-cols-[1.15fr_1fr] gap-10 md:gap-14 py-12 md:py-16 items-start">
				<LessonSummary lessonData={plan.lessonData} eyebrow="alguém montou este plano pra você" />

				<section
					aria-labelledby="plan-title"
					className="md:sticky md:top-8 bg-surface rounded-[28px] p-6 md:p-7 shadow-[0_1px_2px_rgb(var(--shadow)/0.04),0_24px_48px_-24px_rgb(var(--shadow)/0.18)] animate-rise stagger-1"
				>
					<h3 id="plan-title" className="text-lg font-semibold tracking-[-0.01em] mb-5">
						blocos do plano
					</h3>

					<dl className="grid grid-cols-2 gap-2">
						<div className="px-4 py-3.5 rounded-2xl bg-sunken">
							<dt className="text-[0.8125rem] text-ink-muted">foco</dt>
							<dd className="mt-1 font-mono text-lg font-medium">{plan.focoDuration} min</dd>
						</div>
						<div className="px-4 py-3.5 rounded-2xl bg-sunken">
							<dt className="text-[0.8125rem] text-ink-muted">pausa</dt>
							<dd className="mt-1 font-mono text-lg font-medium">{plan.breakDuration} min</dd>
						</div>
					</dl>

					<div className="mt-7">
						<SessionPreview sessions={sessions} />
					</div>

					<Button onClick={() => onStart(plan)} className="group w-full mt-8">
						começar sessão
						<span className="transition-transform duration-300 ease-spring group-hover:translate-x-0.5">
							<ArrowRightIcon />
						</span>
					</Button>
					<button
						type="button"
						onClick={() => onAdjust(plan)}
						className="w-full mt-3 h-10 rounded-full text-sm text-ink-muted hover:text-ink transition-colors cursor-pointer"
					>
						ajustar os blocos antes
					</button>
					<p className="mt-4 pt-4 border-t border-line text-[0.8125rem] text-ink-muted text-center">
						link válido por mais <span className="font-mono text-ink">{formatDays(expiresInDays)}</span>
					</p>
				</section>
			</main>

			<Footer />
		</>
	)
}
