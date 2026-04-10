import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Transaction } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, History, Calendar, CreditCard, Gamepad2, AlertCircle, Loader2, ChevronRight } from 'lucide-react';

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    setError(null);

    // Search by Player ID or Email
    const q = query(
      collection(db, 'transactions'),
      where('playerId', '==', searchQuery.trim()),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(docs);
      setIsLoading(false);
    }, (err) => {
      console.error(err);
      let userMessage = "We couldn't retrieve your transaction history.";
      
      if (err.message.includes('permission-denied')) {
        userMessage = "You don't have permission to view these transactions. Please ensure you're using the correct Player ID.";
      } else if (err.message.includes('quota-exceeded')) {
        userMessage = "Our database is currently experiencing high traffic. Please try again later.";
      } else if (err.message.includes('offline')) {
        userMessage = "You appear to be offline. Please check your connection and try again.";
      }

      setError(userMessage);
      setIsLoading(false);
    });

    return () => unsubscribe();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 md:space-y-4">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-500/10 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto">
          <History className="text-orange-500 md:w-8 md:h-8" size={24} />
        </div>
        <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">Transaction History</h1>
        <p className="text-xs md:text-sm text-white/40 max-w-md mx-auto px-4">
          Enter your Player ID to track your recent top-ups and check their status.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative max-w-xl mx-auto px-4 sm:px-0">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-orange-500 transition-colors" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter Player ID"
            className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl pl-10 pr-4 sm:pr-32 py-3 md:py-4 focus:border-orange-500 outline-none transition-all text-sm md:text-lg"
          />
          <button 
            type="submit"
            className="mt-3 sm:mt-0 sm:absolute sm:right-1.5 sm:top-1.5 sm:bottom-1.5 w-full sm:w-auto bg-orange-500 text-black font-bold px-5 py-2.5 sm:py-0 rounded-lg md:rounded-xl hover:bg-orange-400 transition-colors uppercase text-xs md:text-sm"
          >
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 flex flex-col items-center justify-center gap-4"
            >
              <Loader2 className="text-orange-500 animate-spin" size={40} />
              <p className="text-white/40 font-medium">Searching transactions...</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-4 text-red-500"
            >
              <AlertCircle size={24} />
              <p>{error}</p>
            </motion.div>
          ) : transactions.length > 0 ? (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/40">Recent Transactions</h2>
                <span className="text-xs text-white/20">{transactions.length} results found</span>
              </div>
              {transactions.map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-[#1a1a1a] border border-white/5 rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 hover:border-white/10 transition-colors group"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
                      <Gamepad2 className="text-orange-500 md:w-6 md:h-6" size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base md:text-lg group-hover:text-orange-500 transition-colors uppercase tracking-tight">
                        {tx.gameId.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                      </h3>
                      <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-sm text-white/40">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="md:w-3.5 md:h-3.5" />
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </span>
                        <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                        <span className="flex items-center gap-1">
                          <CreditCard size={12} className="md:w-3.5 md:h-3.5" />
                          {tx.paymentMethod.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 border-t border-white/5 md:border-t-0 pt-3 md:pt-0">
                    <div className="text-left md:text-right">
                      <div className="text-base md:text-xl font-black text-white">₱{tx.amount.toLocaleString()}</div>
                      <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-white/20">Amount Paid</div>
                    </div>
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-2">
                      <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest ${
                        tx.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                        tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {tx.status}
                      </span>
                      <ChevronRight size={14} className="hidden md:block text-white/10 group-hover:text-orange-500 transition-colors md:w-4 md:h-4" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : hasSearched ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                <Search size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">No records found</h3>
                <p className="text-white/40 max-w-xs mx-auto">
                  We couldn't find any transactions for <span className="text-orange-500 font-mono">"{searchQuery}"</span>. 
                  Please double-check your Player ID and try again.
                </p>
              </div>
              <button 
                onClick={() => setSearchQuery('')}
                className="text-orange-500 font-bold uppercase text-xs tracking-[0.2em] hover:text-orange-400 transition-colors"
              >
                Clear Search
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center opacity-20"
            >
              <History size={80} className="mx-auto mb-4" />
              <p className="text-lg font-medium">Your history will appear here</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
