export class ResponseError extends Error {
	constructor(public errorBody: { error?: string; details?: string; statusCode?: number; retryAfter?: number }) {
		super(errorBody.error)

		this.errorBody.statusCode = errorBody.statusCode ?? 500
	}

	toResponse() {
		return Response.json(
			{
				error: this.message,
				details: this.errorBody.details,
				code: this.errorBody.statusCode,
				retryAfter: this.errorBody.retryAfter,
			},
			{
				status: this.errorBody.statusCode,
				headers: this.errorBody.retryAfter === undefined ? undefined : { 'Retry-After': String(this.errorBody.retryAfter) },
			},
		)
	}
}
