import { useEffect, useMemo, useRef, useState } from 'react'
import type { LessonData } from '../../types'
import { generateSessionsData } from '../../utils'
import Logo from '../ui/Logo'
import PauseIcon from '../icons/Pause'
import PlayIcon from '../icons/Play'
import ArrowRightIcon from '../icons/ArrowRight'

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
		[focoDuration, breakDuration, lessonData]
	)

	const [timeLeft, setTimeLeft] = useState(sessions[0].duration * 60)

	const [currentSessionIndex, setCurrentSessionIndex] = useState(0)
	const currentSession = sessions[currentSessionIndex]
	const [isTimerRunning, setIsTimerRunning] = useState(false)
	const isBreak = currentSession.type === 'break'

	const toggleTimer = () => {
		setIsTimerRunning(prev => !prev)
	}

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60)
		const secs = seconds % 60
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
	}

	const handleNextSessionRef = useRef<() => void>(() => {})

	useEffect(() => {
		handleNextSessionRef.current = () => {
			setIsTimerRunning(false)

			setCurrentSessionIndex(prev => {
				const next = prev + 1
				if (next < sessions.length) {
					setTimeLeft(sessions[next].duration * 60)
					return next
				}

				alert('Parabéns! Você completou seu estudo.')
				return prev
			})
		}
	}, [sessions])

	const handleNextSession = () => handleNextSessionRef.current()

	useEffect(() => {
		if (!isTimerRunning) return

		if (timeLeft <= 0) {
			handleNextSessionRef.current()
			return
		}

		const interval = setInterval(() => setTimeLeft(prev => Math.max(prev - 1, 0)), 1000)

		return () => clearInterval(interval)
	}, [isTimerRunning, timeLeft])

	return (
		<div className="flex flex-col items-center justify-between w-full h-full p-6 space-y-8">
			<header className="flex flex-row justify-between w-full">
				<Logo className="text-2xl" onClick={onReset} />

				<div>{/* Perfil */}</div>
			</header>

			<div className="flex-1 flex flex-col items-center justify-center p-6 relative">
				<div className={`absolute top-0 mt-8 text-xs font-medium tracking-widest uppercase`}>
					bloco {currentSessionIndex + 1} de {sessions.length}
				</div>

				<h2 className={`text-2xl md:text-3xl font-medium mb-12 text-center max-w-2xl  animate-fadeIn`}>
					{isBreak ? 'hora de descansar.' : currentSession.label.toLowerCase()}
				</h2>

				<div className="relative mb-16 group cursor-pointer" onClick={toggleTimer}>
					<div
						className={`text-[8rem] md:text-[10rem] lg:text-[12rem] leading-none font-light tracking-tighter tabular-nums select-none transition-all duration-300`}
					>
						{formatTime(timeLeft)}
					</div>
				</div>

				<div className="flex items-center gap-8 z-10">
					<button
						type="button"
						className={`size-16 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 cursor-pointer bg-neutral-900 text-white hover:bg-neutral-800`}
						onClick={toggleTimer}
					>
						{isTimerRunning ? <PauseIcon /> : <PlayIcon />}
					</button>

					<button
						onClick={handleNextSession}
						className={`size-12 rounded-full border flex items-center justify-center transition-all hover:border-red-500 hover:text-red-500 cursor-pointer border-neutral-200 text-neutral-400`}
						title="Pular bloco"
					>
						<ArrowRightIcon />
					</button>
				</div>
			</div>
		</div>
	)
}
