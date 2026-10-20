import { useMemo, useState } from 'react'

import { useShareLink } from '../../hooks/useShareLink'
import type { LessonData } from '../../types'
import { generateSessionsData } from '../../utils'
import ArrowRightIcon from '../icons/ArrowRight'
import LinkIcon from '../icons/Link'
import Button from '../ui/Button'
import Footer from '../ui/Footer'
import Header from '../ui/Header'
import LessonEditor, { type Topic } from '../ui/LessonEditor'
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
	onStartSession: (lessonData: LessonData, focoDuration: number, breakDuration: number) => void
	onBackStage: () => void
	onReset: () => void
}) {
	const [focoDuration, setFocoDuration] = useState(() => pickDuration(FOCO_DURATIONS, initialFocoDuration))
	const [breakDuration, setBreakDuration] = useState(() => pickDuration(BREAK_DURATIONS, initialBreakDuration))
	const [topics, setTopics] = useState<Topic[]>(() => lessonData.lessons.map((label, id) => ({ id, label })))
	const [totalMinutes, setTotalMinutes] = useState(lessonData.totalMinutes)
	const [isShareOpen, setIsShareOpen] = useState(false)

	// o plano com as correções da pessoa: é ele que vai para o cronômetro e para o link compartilhado
	const editedLessonData = useMemo<LessonData>(
		() => ({
			...lessonData,
			totalMinutes,
			lessons: topics.map(topic => topic.label.trim()).filter(Boolean),
		}),
		[lessonData, totalMinutes, topics],
	)
	const { link: shareLink, share } = useShareLink(editedLessonData, focoDuration, breakDuration)

	const proposedSessions = useMemo(
		() =>
			generateSessionsData({
				focoDuration,
				breakDuration,
				lessonData: editedLessonData,
			}),
		[focoDuration, breakDuration, editedLessonData],
	)

	const handleShare = () => {
		setIsShareOpen(true)
		share()
	}

	return (
		<>
			<Header onReset={onReset} />

			<main className="flex-1 grid md:grid-cols-[1.15fr_1fr] gap-10 md:gap-14 py-12 md:py-16 items-start">
				<LessonEditor
					title={lessonData.title}
					topics={topics}
					onTopicsChange={setTopics}
					totalMinutes={totalMinutes}
					onTotalMinutesChange={setTotalMinutes}
				/>

				<section
					aria-labelledby="config-title"
					className="md:sticky md:top-8 bg-surface rounded-[28px] p-6 md:p-7 shadow-[0_1px_2px_rgb(var(--shadow)/0.04),0_24px_48px_-24px_rgb(var(--shadow)/0.18)] animate-rise stagger-1"
				>
					<div className="flex items-center justify-between gap-3 mb-6">
						<h3 id="config-title" className="text-lg font-semibold tracking-[-0.01em]">
							configurar blocos
						</h3>
						<button
							type="button"
							onClick={handleShare}
							aria-haspopup="dialog"
							className="h-8 -mr-2 px-2.5 rounded-full inline-flex items-center gap-1.5 text-[0.8125rem] text-ink-muted cursor-pointer transition-colors hover:text-ink hover:bg-sunken"
						>
							<LinkIcon size={14} />
							compartilhar
						</button>
					</div>

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

					<Button onClick={() => onStartSession(editedLessonData, focoDuration, breakDuration)} className="group w-full mt-8">
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

			<ShareDialog
				open={isShareOpen}
				onClose={() => setIsShareOpen(false)}
				onRetry={share}
				link={shareLink}
				lessonData={editedLessonData}
				focoDuration={focoDuration}
				breakDuration={breakDuration}
				sessions={proposedSessions}
			/>

			<Footer />
		</>
	)
}
