import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Home, History, Download, Share2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function SuccessPage() {
  const { transactionId } = useParams();
  const [copied, setCopied] = React.useState(false);
  const displayId = transactionId || 'GC-' + Math.random().toString(36).substr(2, 9).toUpperCase();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(displayId);
    setCopied(true);
    toast.success('Transaction ID copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1a1a1a] rounded-3xl border border-white/5 overflow-hidden shadow-2xl"
      >
        {/* Success Header */}
        <div className="bg-orange-500 p-6 md:p-12 text-center relative overflow-hidden">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, delay: 0.2 }}
            className="w-14 h-14 md:w-20 md:h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-3 md:mb-6 relative z-10"
          >
            <CheckCircle2 size={28} className="text-orange-500 md:w-10 md:h-10" />
          </motion.div>
          <h1 className="text-xl md:text-3xl font-black text-black uppercase tracking-tighter relative z-10">Payment Successful!</h1>
          <p className="text-black/60 font-bold uppercase text-[10px] md:text-xs tracking-widest mt-1 md:mt-2 relative z-10">Your top-up is being processed</p>
          
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
        </div>

        {/* Receipt Details */}
        <div className="p-6 md:p-8 space-y-6 md:space-y-8">
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/40 border-b border-white/5 pb-1.5 md:pb-2">Transaction Details</h3>
            <div className="space-y-2 md:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/40 text-xs md:text-sm">Transaction ID</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] md:text-sm text-orange-500">{displayId}</span>
                  <button 
                    onClick={copyToClipboard}
                    className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-white/20 hover:text-orange-500"
                    title="Copy ID"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/40 text-xs md:text-sm">Date & Time</span>
                <span className="text-[10px] md:text-sm">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/40 text-xs md:text-sm">Status</span>
                <span className="bg-green-500/10 text-green-500 text-[8px] md:text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">Completed</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/5 space-y-3 md:space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-white/40 mb-0.5 md:mb-1">Total Paid</p>
                <p className="text-2xl md:text-3xl font-black text-orange-500">₱{localStorage.getItem('last_transaction_amount') || '0'}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-white/40 mb-0.5 md:mb-1">Payment Method</p>
                <p className="text-xs md:text-sm font-bold uppercase">{localStorage.getItem('last_payment_method') || 'GCash'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <button className="flex items-center justify-center gap-2 py-3 md:py-4 rounded-xl bg-white/5 border border-white/10 text-[10px] md:text-sm font-bold hover:bg-white/10 transition-colors">
              <Download size={16} className="md:w-[18px] md:h-[18px]" />
              Download PDF
            </button>
            <button className="flex items-center justify-center gap-2 py-3 md:py-4 rounded-xl bg-white/5 border border-white/10 text-[10px] md:text-sm font-bold hover:bg-white/10 transition-colors">
              <Share2 size={16} className="md:w-[18px] md:h-[18px]" />
              Share Receipt
            </button>
          </div>

          <div className="pt-4 md:pt-6 border-t border-white/5 flex flex-col gap-2 md:gap-3">
            <Link 
              to="/" 
              className="w-full py-3 md:py-4 rounded-xl bg-orange-500 text-black font-black uppercase tracking-widest text-xs md:text-sm flex items-center justify-center gap-2 hover:bg-orange-400 transition-all"
            >
              <Home size={16} className="md:w-[18px] md:h-[18px]" />
              Back to Home
            </Link>
            <Link 
              to="/history" 
              className="w-full py-3 md:py-4 rounded-xl bg-white/5 text-white font-black uppercase tracking-widest text-xs md:text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
            >
              <History size={16} className="md:w-[18px] md:h-[18px]" />
              View History
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 text-center">
        <p className="text-white/20 text-xs">
          A confirmation email has been sent to your registered email address.<br />
          Need help? <a href="#" className="text-orange-500 hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
}
