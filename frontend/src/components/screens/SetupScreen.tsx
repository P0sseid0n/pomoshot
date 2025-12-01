import { Fragment, useMemo, useState } from 'react'
import type { LessonData } from '../../types'
import Footer from '../ui/Footer'
import Logo from '../ui/Logo'
import Button from '../ui/Button'
import { generateSessionsData } from '../../utils'

const FOCO_DURATIONS = [5, 10, 20]
const BREAK_DURATIONS = [5, 10, 20]

export default function SetupScreen({
	lessonData,
	onStartSession,
	onReset,
}: {
	lessonData: LessonData
	onStartSession: (focoDuration: number, breakDuration: number) => void
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
		[focoDuration, breakDuration, lessonData]
	)

	const totalWallTime = proposedSessions.reduce((acc, s) => acc + s.duration, 0)

	const estimated = {
		hours: Math.floor(lessonData.totalMinutes / 60),
		minutes: lessonData.totalMinutes % 60,
	}

	return (
		<div className="flex flex-col items-center justify-between w-full h-full p-6 space-y-8">
			<header className="flex flex-row justify-between w-full">
				<Logo className="text-2xl" onClick={onReset} />

				<div>{/* Perfil */}</div>
			</header>

			<main className="flex flex-col items-center">
				<div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-neutral-100 mb-8 mt-12 md:mt-0">
					<div className="flex items-start justify-between mb-6 gap-x-[2%]">
						<div>
							<p className="text-xs font-bold tracking-wider text-red-500 mb-1">assunto identificado</p>
							<h2 className="text-2xl font-semibold text-neutral-900">{lessonData.title.toLowerCase()}</h2>
						</div>
						<div className="text-right">
							<p className="text-xs font-bold tracking-wider text-neutral-400 mb-1">tempo de aulas</p>
							<p className="text-2xl font-medium text-neutral-900 whitespace-nowrap">
								{estimated.hours}h {estimated.minutes}m
							</p>
						</div>
					</div>

					<div className="space-y-2 mb-2">
						{lessonData.lessons.map((lesson, idx) => (
							<div key={idx} className="flex items-center gap-2 text-sm text-neutral-600">
								<div className="size-1.5 rounded-full bg-neutral-300"></div>
								{lesson.toLowerCase()}
							</div>
						))}
					</div>
				</div>

				<div className="w-full mb-16 mt-4">
					<h3 className="text-lg font-medium text-neutral-900 mb-6">configurar blocos</h3>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
						<div>
							<label className="block text-xs font-medium text-neutral-500 uppercase mb-3">foco (min)</label>
							<div className="flex gap-2">
								{FOCO_DURATIONS.map(val => (
									<button
										type="button"
										key={val}
										onClick={() => setFocoDuration(val)}
										className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
											focoDuration === val
												? 'bg-neutral-900 text-white shadow-md'
												: 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300'
										}`}
									>
										{val}m
									</button>
								))}
							</div>
						</div>
						<div>
							<label className="block text-xs font-medium text-neutral-500 uppercase mb-3">pausa (min)</label>
							<div className="flex gap-2">
								{BREAK_DURATIONS.map(val => (
									<button
										type="button"
										key={val}
										onClick={() => setBreakDuration(val)}
										className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
											breakDuration === val
												? 'bg-neutral-900 text-white shadow-md'
												: 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300'
										}`}
									>
										{val}m
									</button>
								))}
							</div>
						</div>
					</div>
					<div className="p-5 bg-neutral-100 rounded-2xl">
						<div className="flex justify-between items-center mb-2">
							<span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">pré-visualização</span>
							<span className="text-xs text-neutral-400">tempo total de sessão: {totalWallTime} min</span>
						</div>
						<div className="flex flex-wrap items-center gap-2 text-lg">
							{proposedSessions.map((session, i) => (
								<Fragment key={i}>
									<span className={`font-medium ${session.type === 'focus' ? 'text-neutral-900' : 'text-red-500'}`}>
										{session.duration}
									</span>
									{i < proposedSessions.length - 1 && <span className="text-neutral-300 text-sm">+</span>}
								</Fragment>
							))}
						</div>
					</div>
				</div>

				<Button onClick={() => onStartSession(focoDuration, breakDuration)}>gerar pomodoro</Button>
			</main>

			<Footer />
		</div>
	)
}
