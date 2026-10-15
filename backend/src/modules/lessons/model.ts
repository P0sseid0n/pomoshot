import { t } from 'elysia'

import { IMAGE_TYPES, MAX_IMAGE_SIZE_MB, MAX_IMAGES } from './limits'

export const LessonExtractResponse = t.Object({
	totalMinutes: t.Number({ description: 'Tempo total de estudo estimado, em minutos' }),
	title: t.String({ description: 'Assunto principal do material' }),
	lessons: t.Array(t.String(), { description: 'Tópicos ou títulos das aulas, em ordem' }),
})

export const LessonExtractAIResponse = t.Composite([t.Object({ isStudyMaterial: t.Boolean() }), LessonExtractResponse])

export const LessonExtractBody = t.Object({
	images: t.Files({ type: IMAGE_TYPES, maxSize: `${MAX_IMAGE_SIZE_MB}m`, minItems: 1, maxItems: MAX_IMAGES }),
})
