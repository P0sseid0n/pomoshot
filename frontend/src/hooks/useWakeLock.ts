import { useEffect } from 'react'

/**
 * Mantém a tela ligada enquanto `enabled` for true (Screen Wake Lock API).
 * O navegador libera o bloqueio quando a aba fica oculta, então ele é pedido de novo ao voltar.
 * Em navegadores sem suporte, não faz nada.
 */
export const useWakeLock = (enabled: boolean) => {
	useEffect(() => {
		if (!enabled || !('wakeLock' in navigator)) return

		let sentinel: WakeLockSentinel | undefined
		let cancelled = false

		const acquire = async () => {
			if (document.visibilityState !== 'visible' || (sentinel && !sentinel.released)) return

			try {
				const lock = await navigator.wakeLock.request('screen')
				if (cancelled) lock.release().catch(() => {})
				else sentinel = lock
			} catch {
				// recusado (ex.: modo economia de bateria): o timer segue sem manter a tela ligada
			}
		}

		acquire()
		document.addEventListener('visibilitychange', acquire)

		return () => {
			cancelled = true
			document.removeEventListener('visibilitychange', acquire)
			sentinel?.release().catch(() => {})
		}
	}, [enabled])
}
