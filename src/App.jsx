import { Component } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import QueueDashboard from "./QueueDashboard";
import PAMDashboardApp from "./pam-dashboard/PAMDashboardApp";

import "./App.css";

// Error boundary to catch rendering errors and show them instead of blank screen
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Dashboard Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: "#ff4d4f", background: "#0a0f14", minHeight: "100vh" }}>
          <h2>Something went wrong</h2>
          <pre style={{ color: "#e5f0ff", whiteSpace: "pre-wrap" }}>
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ marginTop: 20, padding: "8px 16px", cursor: "pointer" }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/queue" element={
          <ErrorBoundary>
            <QueueDashboard />
          </ErrorBoundary>
        } />
        <Route path="/sla" element={
          <ErrorBoundary>
            <PAMDashboardApp />
          </ErrorBoundary>
        } />
        <Route path="*" element={<Navigate to="/queue" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
