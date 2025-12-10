import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Check if it's a wallet-related error
      if (this.state.error?.name === 'WalletNotConnectedError' || 
          this.state.error?.message?.includes('Wallet not connected')) {
        return (
          <div className="alert alert-warning m-3">
            <h4 className="alert-heading">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Wallet Connection Required
            </h4>
            <p>This feature requires a connected wallet. Please connect your wallet to continue.</p>
            <hr />
            <p className="mb-0">
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Try Again
              </button>
            </p>
          </div>
        );
      }

      // Generic error fallback
      return (
        <div className="alert alert-danger m-3">
          <h4 className="alert-heading">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Something went wrong
          </h4>
          <p>An error occurred while loading this component.</p>
          <hr />
          <p className="mb-0">
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try Again
            </button>
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;


