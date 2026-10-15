import { useMemo, useState } from 'react'

import type { LessonData } from '../../types'
import { generateSessionsData } from '../../utils'
import ArrowRightIcon from '../icons/ArrowRight'
import Button from '../ui/Button'
import Footer from '../ui/Footer'
import Header from '../ui/Header'
import Segmented from '../ui/Segmented'

const FOCO_DURATIONS = [5, 10, 20]
const BREAK_DURATIONS = [5, 10, 20]

const formatMinutes = (total: number) => {
	const hours = Math.floor(total / 60)
	const minutes = total % 60
	if (!hours) return `${minutes}m`
	return `${hours}h ${minutes.toString().padStart(2, '0')}m`
}

export default function SetupScreen({
	lessonData,
	onStartSession,
	onBackStage,
	onReset,
}: {
	lessonData: LessonData
	onStartSession: (focoDuration: number, breakDuration: number) => void
	onBackStage: () => void
	onReset: () => void
}) {
	const [focoDuration, setFocoDuration] = useState(FOCO_DURATIONS[0])
	const [breakDuration, setBreakDuration] = useState(BREAK_DURATIONS[0])

	const proposedSessions = useMemo(
		() =>
			generateSessionsData({
				focoDuration,
				breakDuration,
				lessonData,
			}),
		[focoDuration, breakDuration, lessonData],
	)

	const totalWallTime = proposedSessions.reduce((acc, s) => acc + s.duration, 0)
	const focusCount = proposedSessions.filter(s => s.type === 'focus').length
	const breakCount = proposedSessions.length - focusCount

	return (
		<>
			<Header onReset={onReset} />

			<main className="flex-1 grid md:grid-cols-[1.15fr_1fr] gap-10 md:gap-14 py-12 md:py-16 items-start">
				<section aria-labelledby="lesson-title" className="animate-rise">
					<p className="text-sm font-medium text-accent mb-3">assunto identificado</p>
					<h2 id="lesson-title" className="text-3xl md:text-4xl font-semibold tracking-[-0.03em] leading-[1.1]">
						{lessonData.title.toLowerCase()}
					</h2>
					<p className="mt-4 text-ink-muted">
						<span className="font-mono text-ink">{formatMinutes(lessonData.totalMinutes)}</span> de aula em{' '}
						<span className="font-mono text-ink">{lessonData.lessons.length}</span>{' '}
						{lessonData.lessons.length === 1 ? 'tópico' : 'tópicos'}
					</p>

					<ol className="mt-8 border-t border-line">
						{lessonData.lessons.map((lesson, idx) => (
							<li key={idx} className="flex items-baseline gap-4 py-3 border-b border-line text-[0.9375rem]">
								<span className="font-mono text-xs text-ink-faint w-5 shrink-0">{String(idx + 1).padStart(2, '0')}</span>
								<span className="text-ink">{lesson.toLowerCase()}</span>
							</li>
						))}
					</ol>
				</section>

				<section
					aria-labelledby="config-title"
					className="md:sticky md:top-8 bg-surface rounded-[28px] p-6 md:p-7 shadow-[0_1px_2px_rgb(var(--shadow)/0.04),0_24px_48px_-24px_rgb(var(--shadow)/0.18)] animate-rise stagger-1"
				>
					<h3 id="config-title" className="text-lg font-semibold tracking-[-0.01em] mb-6">
						configurar blocos
					</h3>

					<div className="space-y-5">
						<Segmented
							label="foco"
							options={FOCO_DURATIONS}
							value={focoDuration}
							onChange={setFocoDuration}
							format={v => `${v} min`}
						/>
						<Segmented
							label="pausa"
							options={BREAK_DURATIONS}
							value={breakDuration}
							onChange={setBreakDuration}
							format={v => `${v} min`}
						/>
					</div>

					<div className="mt-8">
						<div className="flex items-baseline justify-between mb-3">
							<span className="text-sm font-medium text-ink-muted">sessão</span>
							<span className="font-mono text-2xl font-medium tracking-tight">{formatMinutes(totalWallTime)}</span>
						</div>

						<div
							role="img"
							aria-label={`${focusCount} blocos de foco e ${breakCount} pausas, total de ${totalWallTime} minutos`}
							className="flex gap-[3px] h-2"
						>
							{proposedSessions.map(session => (
								<span
									key={session.id}
									style={{ flexGrow: session.duration }}
									className={`basis-0 rounded-[3px] transition-[flex-grow] duration-500 ease-out-soft ${
										session.type === 'focus' ? 'bg-ink' : 'bg-accent'
									}`}
								/>
							))}
						</div>

						<div className="flex gap-5 mt-3 text-xs text-ink-muted">
							<span className="flex items-center gap-1.5">
								<span className="size-2 rounded-full bg-ink" />
								{focusCount} foco
							</span>
							<span className="flex items-center gap-1.5">
								<span className="size-2 rounded-full bg-accent" />
								{breakCount} {breakCount === 1 ? 'pausa' : 'pausas'}
							</span>
						</div>
					</div>

					<Button onClick={() => onStartSession(focoDuration, breakDuration)} className="group w-full mt-8">
						gerar pomodoro
						<span className="transition-transform duration-300 ease-spring group-hover:translate-x-0.5">
							<ArrowRightIcon />
						</span>
					</Button>
					<button
						type="button"
						onClick={onBackStage}
						className="w-full mt-3 h-10 rounded-full text-sm text-ink-muted hover:text-ink transition-colors cursor-pointer"
					>
						enviar outras capturas
					</button>
				</section>
			</main>

			<Footer />
		</>
	)
}
