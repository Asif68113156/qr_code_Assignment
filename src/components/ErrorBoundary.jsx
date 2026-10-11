import { Component } from 'react';

/** Catches rendering errors in the component tree so the whole app never goes blank. */
export default class ErrorBoundary extends Component {
  state = { hasError: false, message: '' };

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unknown error' };
  }

  componentDidCatch(error, info) {
    console.error('UI error caught by ErrorBoundary:', error, info);
  }

  reset = () => this.setState({ hasError: false, message: '' });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="card error-card" role="alert">
        <h2>Something went wrong</h2>
        <p className="muted">{this.state.message}</p>
        <button className="btn primary" onClick={this.reset}>Try again</button>
      </div>
    );
  }
}
