import { t } from 'elysia'

export const PlanIdParams = t.Object({
	id: t.String({ maxLength: 32, description: 'ID curto do plano, vindo do link compartilhado' }),
})

export const SharedPlanBody = t.Object({
	lessonData: t.Object({
		totalMinutes: t.Number({ minimum: 1, maximum: 1440, description: 'Tempo total de estudo, em minutos' }),
		title: t.String({ minLength: 1, maxLength: 200, description: 'Assunto principal do material' }),
		lessons: t.Array(t.String({ maxLength: 200 }), { maxItems: 100, description: 'Tópicos ou títulos das aulas, em ordem' }),
	}),
	focoDuration: t.Integer({ minimum: 1, maximum: 120, description: 'Duração de cada bloco de foco, em minutos' }),
	breakDuration: t.Integer({ minimum: 1, maximum: 120, description: 'Duração de cada pausa, em minutos' }),
})

const ExpiresAt = t.Number({ description: 'Quando o link expira, em milissegundos desde a época Unix' })

export const SharedPlanCreated = t.Object({
	id: t.String({ description: 'ID curto do plano; o link é /?p=<id>' }),
	expiresAt: ExpiresAt,
})

export const SharedPlanResponse = t.Composite([SharedPlanBody, t.Object({ expiresAt: ExpiresAt })])
