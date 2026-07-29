import { Component, type ReactNode } from "react"

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>
          <h2 style={{ color: "var(--color-danger)" }}>Something went wrong</h2>
          <p style={{ fontSize: "0.8rem" }}>{this.state.error?.message}</p>
          <button className="btn-primary" onClick={() => this.setState({ hasError: false })}>Retry</button>
        </div>
      )
    }
    return this.props.children
  }
}
