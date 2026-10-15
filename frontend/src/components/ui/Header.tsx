import Logo from './Logo'

export default function Header({ onReset, children }: { onReset: () => void; children?: React.ReactNode }) {
	return (
		<header className="flex items-center justify-between w-full h-10">
			<Logo className="text-xl" onClick={onReset} />
			{children}
		</header>
	)
}
