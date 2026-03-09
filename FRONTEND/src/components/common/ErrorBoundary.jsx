import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
                    <h1 style={{ color: '#e11d48' }}>Something went wrong.</h1>
                    <p style={{ color: '#52525b' }}>An unexpected error occurred in the application.</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '1rem',
                            padding: '0.5rem 1.5rem',
                            background: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer'
                        }}
                    >
                        Refresh Page
                    </button>
                    <div style={{ marginTop: '2rem', textAlign: 'left', background: '#ffe4e6', color: '#881337', padding: '1.5rem', borderRadius: '0.75rem', overflowX: 'auto', border: '1px solid #fda4af' }}>
                        <h3 style={{ marginTop: 0 }}>Error Details (Please screenshot this):</h3>
                        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '13px' }}>
                            {this.state.error && this.state.error.toString()}
                            {'\n'}
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
