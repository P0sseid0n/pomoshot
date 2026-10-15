import React from 'react'

import Loading from '../icons/Loading'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'ghost'
	isLoading?: boolean
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', isLoading = false, className = '', ...props }) => {
	const baseStyles =
		'inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full font-medium text-[0.9375rem] cursor-pointer select-none transition-[background-color,color,box-shadow,translate,scale] duration-200 ease-out-soft active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100'

	const variants = {
		primary:
			'bg-ink text-paper shadow-[0_1px_0_rgb(255_255_255/0.12)_inset,0_8px_20px_-8px_rgb(var(--shadow)/0.5)] hover:-translate-y-px hover:shadow-[0_1px_0_rgb(255_255_255/0.12)_inset,0_12px_24px_-10px_rgb(var(--shadow)/0.55)] disabled:hover:translate-y-0',
		secondary: 'bg-surface text-ink ring-1 ring-line hover:ring-ink-faint',
		ghost: 'px-4 bg-transparent text-ink-muted hover:text-ink hover:bg-sunken',
	}

	return (
		<button
			className={`${baseStyles} ${variants[variant]} ${className}`}
			disabled={isLoading || props.disabled}
			aria-busy={isLoading || undefined}
			{...props}
		>
			{isLoading ? (
				<>
					<Loading />
					processando
				</>
			) : (
				children
			)}
		</button>
	)
}

export default Button
