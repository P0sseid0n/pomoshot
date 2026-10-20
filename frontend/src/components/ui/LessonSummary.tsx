import type { LessonData } from '../../types'
import { formatMinutes } from '../../utils'

export default function LessonSummary({ lessonData, eyebrow }: { lessonData: LessonData; eyebrow: string }) {
	return (
		<section aria-labelledby="lesson-title" className="animate-rise">
			<p className="text-sm font-medium text-accent mb-3">{eyebrow}</p>
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
	)
}
