import React from 'react'
import Loading from '../icons/Loading'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'ghost'
	isLoading?: boolean
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', isLoading = false, className = '', ...props }) => {
	const baseStyles =
		'px-6 py-3 rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide cursor-pointer'

	const variants = {
		primary: 'bg-neutral-900 text-white hover:bg-neutral-800 focus:ring-neutral-900 shadow-lg shadow-neutral-200',
		secondary: 'bg-white text-neutral-900 border border-neutral-200 hover:border-neutral-400 focus:ring-neutral-200',
		ghost: 'bg-transparent text-neutral-500 hover:text-neutral-900',
	}

	return (
		<button className={`${baseStyles} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
			{isLoading ? (
				<span className="flex items-center justify-center gap-2">
					<Loading />
					processando
				</span>
			) : (
				children
			)}
		</button>
	)
}

export default Button
