import { useMemo, useState } from 'react'

import { useShareLink } from '../../hooks/useShareLink'
import type { LessonData } from '../../types'
import { generateSessionsData } from '../../utils'
import ArrowRightIcon from '../icons/ArrowRight'
import LinkIcon from '../icons/Link'
import Button from '../ui/Button'
import Footer from '../ui/Footer'
import Header from '../ui/Header'
import LessonSummary from '../ui/LessonSummary'
import Segmented from '../ui/Segmented'
import SessionPreview from '../ui/SessionPreview'
import ShareDialog from '../ui/ShareDialog'

const FOCO_DURATIONS = [5, 10, 20]
const BREAK_DURATIONS = [5, 10, 20]

const pickDuration = (options: number[], value?: number) => (value !== undefined && options.includes(value) ? value : options[0])

export default function SetupScreen({
	lessonData,
	initialFocoDuration,
	initialBreakDuration,
	onStartSession,
	onBackStage,
	onReset,
}: {
	lessonData: LessonData
	initialFocoDuration?: number
	initialBreakDuration?: number
	onStartSession: (focoDuration: number, breakDuration: number) => void
	onBackStage: () => void
	onReset: () => void
}) {
	const [focoDuration, setFocoDuration] = useState(() => pickDuration(FOCO_DURATIONS, initialFocoDuration))
	const [breakDuration, setBreakDuration] = useState(() => pickDuration(BREAK_DURATIONS, initialBreakDuration))
	const [isShareOpen, setIsShareOpen] = useState(false)
	const { link: shareLink, share } = useShareLink(lessonData, focoDuration, breakDuration)

	const proposedSessions = useMemo(
		() =>
			generateSessionsData({
				focoDuration,
				breakDuration,
				lessonData,
			}),
		[focoDuration, breakDuration, lessonData],
	)

	const handleShare = () => {
		setIsShareOpen(true)
		share()
	}

	return (
		<>
			<Header onReset={onReset} />

			<main className="flex-1 grid md:grid-cols-[1.15fr_1fr] gap-10 md:gap-14 py-12 md:py-16 items-start">
				<LessonSummary lessonData={lessonData} eyebrow="assunto identificado" />

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
						<SessionPreview sessions={proposedSessions} />
					</div>

					<Button onClick={() => onStartSession(focoDuration, breakDuration)} className="group w-full mt-8">
						gerar pomodoro
						<span className="transition-transform duration-300 ease-spring group-hover:translate-x-0.5">
							<ArrowRightIcon />
						</span>
					</Button>
					<div className="flex flex-wrap gap-2 mt-3">
						<button
							type="button"
							onClick={onBackStage}
							className="grow h-10 px-4 rounded-full text-sm text-ink-muted whitespace-nowrap hover:text-ink transition-colors cursor-pointer"
						>
							enviar outras capturas
						</button>
						<button
							type="button"
							onClick={handleShare}
							aria-haspopup="dialog"
							className="grow h-10 px-4 rounded-full flex items-center justify-center gap-1.5 text-sm text-ink whitespace-nowrap ring-1 ring-line hover:ring-ink-faint transition-shadow cursor-pointer"
						>
							<LinkIcon />
							compartilhar plano
						</button>
					</div>
				</section>
			</main>

			<ShareDialog
				open={isShareOpen}
				onClose={() => setIsShareOpen(false)}
				onRetry={share}
				link={shareLink}
				lessonData={lessonData}
				focoDuration={focoDuration}
				breakDuration={breakDuration}
				sessions={proposedSessions}
			/>

			<Footer />
		</>
	)
}
