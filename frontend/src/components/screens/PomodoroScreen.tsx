import { useCallback, useEffect, useMemo, useState } from 'react'

import type { LessonData } from '../../types'
import { generateSessionsData } from '../../utils'
import ArrowRightIcon from '../icons/ArrowRight'
import PauseIcon from '../icons/Pause'
import PlayIcon from '../icons/Play'
import Button from '../ui/Button'
import Header from '../ui/Header'

const formatTime = (seconds: number) => {
	const mins = Math.floor(seconds / 60)
	const secs = seconds % 60
	return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default function PomodoroScreen({
	lessonData,
	focoDuration,
	breakDuration,
	onReset,
}: {
	lessonData: LessonData
	focoDuration: number
	breakDuration: number
	onReset: () => void
}) {
	const sessions = useMemo(
		() =>
			generateSessionsData({
				focoDuration,
				breakDuration,
				lessonData,
			}),
		[focoDuration, breakDuration, lessonData],
	)

	const [timeLeft, setTimeLeft] = useState(sessions[0].duration * 60)

	const [currentSessionIndex, setCurrentSessionIndex] = useState(0)
	const currentSession = sessions[currentSessionIndex]
	const nextSession = sessions[currentSessionIndex + 1]
	const [isTimerRunning, setIsTimerRunning] = useState(false)
	const [isFinished, setIsFinished] = useState(false)
	const isBreak = currentSession.type === 'break'
	const currentProgress = 1 - timeLeft / (currentSession.duration * 60)

	const toggleTimer = () => {
		setIsTimerRunning(prev => !prev)
	}

	const handleNextSession = useCallback(() => {
		setIsTimerRunning(false)

		const audio = new Audio('/sounds/bell.mp3')
		audio.play().catch(() => {})

		const next = currentSessionIndex + 1
		if (next < sessions.length) {
			setCurrentSessionIndex(next)
			setTimeLeft(sessions[next].duration * 60)
		} else {
			setIsFinished(true)
		}
	}, [sessions, currentSessionIndex])

	useEffect(() => {
		if (!isTimerRunning) return

		const timeout = setTimeout(() => (timeLeft > 0 ? setTimeLeft(timeLeft - 1) : handleNextSession()), timeLeft > 0 ? 1000 : 0)

		return () => clearTimeout(timeout)
	}, [isTimerRunning, timeLeft, handleNextSession])

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.code !== 'Space' || isFinished) return
			if (e.target instanceof HTMLElement && e.target.closest('button, input, textarea, a')) return
			e.preventDefault()
			setIsTimerRunning(prev => !prev)
		}

		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [isFinished])

	useEffect(() => {
		const previousTitle = document.title
		document.title = isFinished ? 'concluído — pomoshot' : `${formatTime(timeLeft)} · ${isBreak ? 'pausa' : 'foco'} — pomoshot`
		return () => {
			document.title = previousTitle
		}
	}, [timeLeft, isBreak, isFinished])

	if (isFinished) {
		const totalFocus = sessions.filter(s => s.type === 'focus').reduce((acc, s) => acc + s.duration, 0)

		return (
			<>
				<Header onReset={onReset} />
				<main className="flex-1 flex flex-col items-center justify-center text-center pb-16">
					<span className="size-3 rounded-full bg-accent animate-rise" aria-hidden />
					<h2 className="mt-8 text-4xl md:text-5xl font-semibold tracking-[-0.035em] animate-rise stagger-1">
						estudo concluído.
					</h2>
					<p className="mt-4 text-ink-muted max-w-[36ch] animate-rise stagger-2">
						<span className="font-mono text-ink">{totalFocus} min</span> de foco em {lessonData.title.toLowerCase()}.
					</p>
					<div className="mt-10 animate-rise stagger-3">
						<Button onClick={onReset}>criar outro pomodoro</Button>
					</div>
				</main>
			</>
		)
	}

	return (
		<>
			<div
				aria-hidden
				className={`pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_45%,var(--accent-soft),transparent_75%)] transition-opacity duration-1000 ${
					isBreak ? 'opacity-80' : 'opacity-0'
				}`}
			/>

			<Header onReset={onReset}>
				<span className="font-mono text-sm text-ink-muted">
					<span className="text-ink">{currentSessionIndex + 1}</span>/{sessions.length}
				</span>
			</Header>

			<main className="relative flex-1 flex flex-col items-center justify-center py-10">
				<ol aria-label="Progresso dos blocos" className="flex gap-1 w-full max-w-md h-1 mb-14">
					{sessions.map((session, i) => {
						const fill = i < currentSessionIndex ? 1 : i === currentSessionIndex ? currentProgress : 0
						return (
							<li
								key={session.id}
								style={{ flexGrow: session.duration }}
								className="basis-0 rounded-full bg-line overflow-hidden"
								aria-current={i === currentSessionIndex ? 'step' : undefined}
							>
								<span
									style={{ transform: `scaleX(${fill})` }}
									className={`block h-full origin-left transition-transform duration-1000 ease-linear ${
										session.type === 'focus' ? 'bg-ink' : 'bg-accent'
									}`}
								/>
							</li>
						)
					})}
				</ol>

				<p
					key={`label-${currentSessionIndex}`}
					className={`text-sm font-medium animate-rise ${isBreak ? 'text-accent' : 'text-ink-muted'}`}
				>
					{isBreak ? 'pausa' : 'foco'}
				</p>
				<h2
					key={`title-${currentSessionIndex}`}
					className="mt-2 text-2xl md:text-3xl font-medium tracking-[-0.02em] text-center max-w-[28ch] animate-rise stagger-1"
				>
					{isBreak ? 'hora de descansar.' : currentSession.label.toLowerCase()}
				</h2>

				<button
					type="button"
					onClick={toggleTimer}
					aria-label={isTimerRunning ? 'Pausar timer' : 'Iniciar timer'}
					className={`mt-8 mb-10 rounded-3xl px-2 font-mono font-light text-[clamp(4.5rem,21vw,11rem)] leading-none tracking-[-0.06em] tabular-nums select-none cursor-pointer transition-opacity duration-300 ${
						isTimerRunning ? 'opacity-100' : 'opacity-60 hover:opacity-80'
					}`}
				>
					<time>{formatTime(timeLeft)}</time>
				</button>

				<div className="flex items-center gap-4">
					<button
						type="button"
						onClick={toggleTimer}
						aria-label={isTimerRunning ? 'Pausar' : 'Iniciar'}
						className="size-16 rounded-full flex items-center justify-center cursor-pointer bg-ink text-paper shadow-[0_10px_24px_-10px_rgb(var(--shadow)/0.6)] transition-[scale,box-shadow] duration-300 ease-spring hover:scale-105 active:scale-95"
					>
						<span className={isTimerRunning ? '' : 'translate-x-[1.5px]'}>{isTimerRunning ? <PauseIcon /> : <PlayIcon />}</span>
					</button>

					<button
						type="button"
						onClick={handleNextSession}
						aria-label="Pular bloco"
						title="Pular bloco"
						className="size-12 rounded-full flex items-center justify-center cursor-pointer bg-surface text-ink-muted ring-1 ring-line transition-[color,box-shadow,scale] duration-200 hover:text-accent hover:ring-accent active:scale-95"
					>
						<ArrowRightIcon />
					</button>
				</div>

				<p className="mt-12 text-sm text-ink-faint text-center min-h-5">
					{nextSession && (
						<>
							a seguir:{' '}
							<span className="text-ink-muted">
								{nextSession.type === 'break' ? `pausa de ${nextSession.duration} min` : nextSession.label.toLowerCase()}
							</span>
						</>
					)}
				</p>
				<p className="mt-2 text-xs text-ink-faint hidden md:block">
					<kbd className="font-mono px-1.5 py-0.5 rounded-md bg-sunken text-ink-muted">espaço</kbd> para{' '}
					{isTimerRunning ? 'pausar' : 'iniciar'}
				</p>
			</main>
		</>
	)
}
