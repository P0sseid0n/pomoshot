import { t } from 'elysia'

import { IMAGE_TYPES, MAX_IMAGE_SIZE_MB, MAX_IMAGES } from './limits'

export const LessonExtractResponse = t.Object({
	totalMinutes: t.Number(),
	title: t.String(),
	lessons: t.Array(t.String()),
})

export const LessonExtractAIResponse = t.Composite([t.Object({ isStudyMaterial: t.Boolean() }), LessonExtractResponse])

export const LessonExtractBody = t.Object({
	images: t.Files({ type: IMAGE_TYPES, maxSize: `${MAX_IMAGE_SIZE_MB}m`, minItems: 1, maxItems: MAX_IMAGES }),
})
