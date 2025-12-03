import { t } from 'elysia'

export const LessonExtractResponse = t.Object({
	totalMinutes: t.Number(),
	title: t.String(),
	lessons: t.Array(t.String()),
})

export const LessonExtractBody = t.Object({
	images: t.Files(),
})
