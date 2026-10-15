import { t } from 'elysia'

export const LessonExtractResponse = t.Object({
	totalMinutes: t.Number(),
	title: t.String(),
	lessons: t.Array(t.String()),
})

export const LessonExtractAIResponse = t.Composite([t.Object({ isStudyMaterial: t.Boolean() }), LessonExtractResponse])

export const LessonExtractBody = t.Object({
	images: t.Files(),
})
