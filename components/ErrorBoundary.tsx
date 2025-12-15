
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center text-amber-900">
                    <h2 className="text-3xl font-serif font-bold mb-4">Oops! Something went wrong.</h2>
                    <p className="mb-6 max-w-md">
                        We're sorry, but an unexpected error occurred. Please try refreshing the page.
                    </p>
                    {this.state.error && (
                        <pre className="bg-amber-100 p-4 rounded text-xs text-left overflow-auto max-w-lg mb-6 border border-amber-200">
                            {this.state.error.toString()}
                        </pre>
                    )}
                    <button
                        className="px-6 py-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors font-semibold"
                        onClick={() => window.location.reload()}
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
