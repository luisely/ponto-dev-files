import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
	children: ReactNode
}

interface ErrorBoundaryState {
	hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	state: ErrorBoundaryState = { hasError: false }

	static getDerivedStateFromError(): ErrorBoundaryState {
		return { hasError: true }
	}

	componentDidCatch(error: Error, info: ErrorInfo): void {
		console.error('Erro inesperado de renderização:', error, info)
	}

	private handleReload = () => {
		window.location.reload()
	}

	render(): ReactNode {
		if (this.state.hasError) {
			return (
				<div className="flex flex-col items-center justify-center h-full w-full px-4">
					<div className="w-full max-w-md bg-[#0D0D0D]/50 border border-[#1D4A2E] rounded-lg p-8 backdrop-blur-sm text-center">
						<h2 className="text-xl font-semibold text-white mb-2">Algo deu errado</h2>
						<p className="text-gray-400 text-sm mb-6">Ocorreu um erro inesperado. Tente recarregar a aplicação.</p>
						<button
							type="button"
							onClick={this.handleReload}
							className="w-full bg-linear-to-br from-[#54dd89] to-[#2ea15b] cursor-pointer text-white rounded-lg px-6 py-3 flex items-center justify-center font-medium text-base hover:shadow-lg transition-all"
						>
							Recarregar
						</button>
					</div>
				</div>
			)
		}

		return this.props.children
	}
}

export default ErrorBoundary
