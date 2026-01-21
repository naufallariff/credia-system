import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/button';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Di production, kirim ini ke Sentry/LogRocket
        console.error("Uncaught error:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                    <div className="max-w-md w-full bg-white border border-red-100 rounded-xl shadow-lg p-6 text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>

                        <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
                        <p className="text-slate-500 text-sm mb-6">
                            The application encountered an unexpected error. We apologize for the inconvenience.
                        </p>

                        {/* Dev Only: Show Error Details */}
                        {import.meta.env.DEV && (
                            <div className="mb-6 p-3 bg-slate-100 rounded text-left overflow-auto max-h-32">
                                <code className="text-xs text-red-600 font-mono">
                                    {this.state.error?.toString()}
                                </code>
                            </div>
                        )}

                        <Button onClick={this.handleReload} className="w-full gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Reload Application
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;