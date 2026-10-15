import type { Static } from 'elysia'

import * as LessonModel from '../modules/lessons/model'

export type LessonExtractResponse = Static<typeof LessonModel.LessonExtractResponse>

export interface LessonCachedData extends LessonExtractResponse {
	cachedAt: number
	lastLesson: string | null
}
