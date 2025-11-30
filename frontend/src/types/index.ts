import type { Treaty } from '@elysiajs/eden'
import type { Client } from '../api'

export type LessonData = Treaty.Data<typeof Client.lessons.extract.post>
