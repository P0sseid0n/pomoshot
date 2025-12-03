export class ResponseError extends Error {
	constructor(public errorBody: { error?: string; details?: string; statusCode?: number }) {
		super(errorBody.error)

		this.errorBody.statusCode = errorBody.statusCode ?? 500
	}

	toResponse() {
		return Response.json(
			{
				error: this.message,
				details: this.errorBody.details,
				code: this.errorBody.statusCode,
			},
			{
				status: this.errorBody.statusCode,
			}
		)
	}
}
