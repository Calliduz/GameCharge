import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Gamepad2, Search, ShoppingCart, User, History, X, Trash2, ShoppingBag, ArrowUp, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';

const MOCK_GAMES = [
  { id: 'honor-of-kings', name: 'Honor of Kings', category: 'MOBA', imageUrl: 'https://picsum.photos/seed/hok/600/800' },
  { id: 'clash-of-clans', name: 'Clash of Clans', category: 'Strategy', imageUrl: 'https://picsum.photos/seed/coc/600/800' },
  { id: 'mobile-legends', name: 'Mobile Legends', category: 'MOBA', imageUrl: 'https://picsum.photos/seed/mlbb/600/800' },
  { id: 'genshin-impact', name: 'Genshin Impact', category: 'RPG', imageUrl: 'https://picsum.photos/seed/genshin/600/800' },
  { id: 'pubg-mobile', name: 'PUBG Mobile', category: 'Battle Royale', imageUrl: 'https://picsum.photos/seed/pubg/600/800' },
  { id: 'free-fire', name: 'Free Fire', category: 'Battle Royale', imageUrl: 'https://picsum.photos/seed/ff/600/800' },
  { id: 'valorant', name: 'Valorant', category: 'FPS', imageUrl: 'https://picsum.photos/seed/valorant/600/800' },
  { id: 'roblox', name: 'Roblox', category: 'Platform', imageUrl: 'https://picsum.photos/seed/roblox/600/800' }
];

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { cart, removeFromCart, cartTotal } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState<typeof MOCK_GAMES>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = MOCK_GAMES.filter(game => 
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleSuggestionClick = (gameId: string) => {
    setSearchQuery('');
    setShowSuggestions(false);
    navigate(`/game/${gameId}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#121212]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-500 rounded-lg md:rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Gamepad2 className="text-black" size={20} />
            </div>
            <span className="text-lg md:text-xl font-bold tracking-tighter uppercase hidden sm:block">GameCharge</span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:block relative flex-1 max-w-md" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-1.5 focus-within:border-orange-500/50 transition-colors">
              <Search size={18} className="text-white/40" />
              <input 
                type="text" 
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                placeholder="Search games..." 
                className="bg-transparent border-none focus:ring-0 text-sm w-full ml-2 placeholder:text-white/20"
              />
              <div className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-white/40 ml-2">
                <Command size={10} /> K
              </div>
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery('')}
                  className="text-white/20 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </form>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50"
                >
                  <div className="p-2">
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white/20">Suggestions</div>
                    {suggestions.map((game) => (
                      <button
                        key={game.id}
                        onClick={() => handleSuggestionClick(game.id)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors text-left group"
                      >
                        <img 
                          src={game.imageUrl} 
                          alt={game.name} 
                          className="w-10 h-10 rounded-lg object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="text-sm font-bold group-hover:text-orange-500 transition-colors">{game.name}</div>
                          <div className="text-[10px] text-white/40 uppercase tracking-wider">{game.category}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={handleSearchSubmit}
                    className="w-full p-3 bg-white/5 text-xs font-bold uppercase tracking-widest hover:bg-orange-500 hover:text-black transition-all"
                  >
                    View all results for "{searchQuery}"
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <Search size={20} />
            </button>
            <Link to="/history" className="p-2 hover:bg-white/5 rounded-full transition-colors relative group">
              <History size={20} />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-tighter hidden md:block">History</span>
            </Link>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-2 hover:bg-white/5 rounded-full transition-colors relative group"
            >
              <ShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-orange-500 text-black text-[10px] font-black flex items-center justify-center rounded-full">
                  {cart.length}
                </span>
              )}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-tighter hidden md:block">Cart</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-[#121212] border-b border-white/10 overflow-hidden"
            >
              <div className="p-4">
                <form onSubmit={handleSearchSubmit} className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                  <Search size={18} className="text-white/40" />
                  <input 
                    type="text" 
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search games..." 
                    className="bg-transparent border-none focus:ring-0 text-sm w-full ml-2"
                  />
                  <button type="button" onClick={() => setIsMobileSearchOpen(false)}>
                    <X size={18} className="text-white/40" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#121212] border-l border-white/10 z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="text-black" size={20} />
                  </div>
                  <h2 className="text-xl font-bold uppercase tracking-tight">Your Cart</h2>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                    <ShoppingCart size={64} />
                    <div className="space-y-1">
                      <p className="font-bold uppercase tracking-widest text-xs">Your cart is empty</p>
                      <p className="text-sm">Add some items to get started!</p>
                    </div>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="bg-white/5 rounded-2xl p-4 border border-white/5 flex gap-4 group">
                      <img 
                        src={item.game.imageUrl} 
                        alt={item.game.name} 
                        className="w-16 h-20 rounded-xl object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm truncate">{item.game.name}</h4>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-white/20 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-xs text-orange-500 font-bold mt-1">{item.product.name}</p>
                        <p className="text-[10px] text-white/40 mt-1 font-mono">{item.playerId}</p>
                        <div className="flex justify-between items-end mt-2">
                          <span className="text-sm font-black">₱{item.product.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-white/10 space-y-4 bg-[#0a0a0a]">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold uppercase tracking-widest text-white/40">Total Amount</span>
                    <span className="text-2xl font-black text-orange-500">₱{cartTotal.toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setIsCartOpen(false);
                      // In a real app, this would go to a multi-item checkout
                      // For now, we'll just simulate a bulk purchase
                      navigate('/success');
                    }}
                    className="w-full py-4 bg-orange-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/20"
                  >
                    Checkout Now
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Back to Top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-[100] w-12 h-12 bg-orange-500 text-black rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/20 hover:scale-110 transition-transform active:scale-95"
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-top border-white/10 bg-[#0a0a0a] py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Gamepad2 className="text-black" size={18} />
              </div>
              <span className="text-lg font-bold tracking-tighter uppercase">GameCharge</span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed">
              The fastest and most reliable gaming top-up platform in the region. Instant delivery, secure payments.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-white/60">Support</h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li><a href="#" className="hover:text-orange-500 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-white/60">Follow Us</h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li><a href="#" className="hover:text-orange-500 transition-colors">Facebook</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Twitter</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-white/60">Newsletter</h4>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm w-full focus:border-orange-500 outline-none transition-colors"
              />
              <button className="bg-orange-500 text-black font-bold px-4 py-2 rounded-lg text-sm hover:bg-orange-400 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-white/5 text-center text-xs text-white/20">
          © 2026 GameCharge. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
