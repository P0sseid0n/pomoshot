import type { Static } from 'elysia'

import * as LessonModel from '../modules/lessons/model'
import * as PlanModel from '../modules/plans/model'

export type LessonExtractResponse = Static<typeof LessonModel.LessonExtractResponse>

export type SharedPlan = Static<typeof PlanModel.SharedPlanBody>

export interface LessonCachedData extends LessonExtractResponse {
	cachedAt: number
	lastLesson: string | null
}
