import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // In a real deployment, send this to an error-tracking service
    // (Sentry, LogRocket, etc.) instead of just the console.
    console.error("Unhandled UI error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "40px 20px",
            gap: "16px",
          }}
        >
          <h2>Something went wrong.</h2>
          <p>
            Sorry about that — please try refreshing the page. If this
            keeps happening, let us know through the Contact page.
          </p>
          <button onClick={this.handleReload} className="btn">
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
