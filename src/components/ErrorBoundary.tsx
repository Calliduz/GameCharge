import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component<any, any> {
  state = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    const state = this.state as any;
    if (state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-8">
          <div className="w-24 h-24 bg-red-500/10 rounded-[2rem] flex items-center justify-center text-red-500 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
            <AlertCircle size={48} />
          </div>
          
          <div className="space-y-3 max-w-md">
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">Something went wrong</h1>
            <p className="text-white/40 leading-relaxed">
              We encountered an unexpected error. This might be a temporary issue with our connection or a glitch in the arena.
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-3 bg-orange-500 text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/20 group"
          >
            <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
            Reload Page
          </button>
          
          <div className="pt-8 border-t border-white/5 w-full max-w-xs">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/10">Technical Details</p>
            <p className="text-[10px] font-mono text-white/20 mt-1 truncate">
              {state.error?.message || 'Unknown Error'}
            </p>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

export default ErrorBoundary;
