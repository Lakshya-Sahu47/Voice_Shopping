import { Component, ErrorInfo, ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught rendering exception:", error, errorInfo);
  }

  private handleReset = () => {
    localStorage.clear();
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#0b0f14", color: "#e7eef8", fontFamily: "sans-serif", textAlign: "center" }}>
          <h1 style={{ color: "#ff477e", fontSize: "2rem", marginBottom: 12 }}>Something went wrong</h1>
          <p style={{ color: "#a8b3c7", maxWidth: 500, lineHeight: 1.5, marginBottom: 20 }}>
            An unexpected error occurred in the user interface. You can attempt to refresh the page or clear the local database cache to restore function.
          </p>
          <div style={{ padding: "12px 18px", borderRadius: 12, backgroundColor: "#121823", border: "1px solid rgba(255, 255, 255, 0.08)", fontFamily: "monospace", fontSize: 13, marginBottom: 24, maxWidth: "90%", overflowX: "auto" }}>
            {this.state.error?.toString()}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn--primary" onClick={() => window.location.reload()} style={{ padding: "10px 18px", fontSize: 14 }}>
              Reload Page
            </button>
            <button className="btn" onClick={this.handleReset} style={{ padding: "10px 18px", fontSize: 14, borderColor: "#ff477e59", backgroundColor: "#ff477e14" }}>
              Clear Database & Restart
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
