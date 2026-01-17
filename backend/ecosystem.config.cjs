module.exports = {
	apps: [
		{
			name: 'pomoshot-backend',
			script: 'bun',
			args: 'run src/index.ts',
			interpreter: 'none',
			env: {
				NODE_ENV: 'production',
			},
		},
	],
}
