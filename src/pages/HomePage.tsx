import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Game } from '../types';
import GameCard from '../components/GameCard';
import Skeleton from '../components/Skeleton';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { SearchX, Zap, ShieldCheck, Clock, ChevronDown, Search } from 'lucide-react';

const MOCK_GAMES: Game[] = [
  {
    id: 'honor-of-kings',
    name: 'Honor of Kings',
    category: 'MOBA',
    imageUrl: 'https://picsum.photos/seed/hok/600/800',
    playerFieldLabel: 'Player ID',
  },
  {
    id: 'clash-of-clans',
    name: 'Clash of Clans',
    category: 'Strategy',
    imageUrl: 'https://picsum.photos/seed/coc/600/800',
    playerFieldLabel: 'Player Tag',
  },
  {
    id: 'mobile-legends',
    name: 'Mobile Legends',
    category: 'MOBA',
    imageUrl: 'https://picsum.photos/seed/mlbb/600/800',
    playerFieldLabel: 'User ID',
    serverFieldLabel: 'Zone ID',
  },
  {
    id: 'genshin-impact',
    name: 'Genshin Impact',
    category: 'RPG',
    imageUrl: 'https://picsum.photos/seed/genshin/600/800',
    playerFieldLabel: 'UID',
    serverFieldLabel: 'Server',
  },
  {
    id: 'pubg-mobile',
    name: 'PUBG Mobile',
    category: 'Battle Royale',
    imageUrl: 'https://picsum.photos/seed/pubg/600/800',
    playerFieldLabel: 'Character ID',
  },
  {
    id: 'free-fire',
    name: 'Free Fire',
    category: 'Battle Royale',
    imageUrl: 'https://picsum.photos/seed/ff/600/800',
    playerFieldLabel: 'Player ID',
  },
  {
    id: 'valorant',
    name: 'Valorant',
    category: 'FPS',
    imageUrl: 'https://picsum.photos/seed/valorant/600/800',
    playerFieldLabel: 'Riot ID',
  },
  {
    id: 'roblox',
    name: 'Roblox',
    category: 'Platform',
    imageUrl: 'https://picsum.photos/seed/roblox/600/800',
    playerFieldLabel: 'Username',
  }
];

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || 'All';
  const searchQuery = searchParams.get('q') || '';
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isRecentSearchesOpen, setIsRecentSearchesOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state for better UX demonstration
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recent searches', e);
      }
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setRecentSearches(prev => {
        const filtered = prev.filter(s => s.toLowerCase() !== searchQuery.toLowerCase());
        const updated = [searchQuery, ...filtered].slice(0, 5);
        localStorage.setItem('recent_searches', JSON.stringify(updated));
        return updated;
      });
    }
  }, [searchQuery]);

  // Mouse Parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const rotateX = useTransform(y, [-300, 300], [5, -5]);
  const rotateY = useTransform(x, [-300, 300], [-5, 5]);

  // Parallax transforms moved to top level to avoid conditional hook errors
  const bgX = useTransform(x, [-300, 300], [-20, 20]);
  const bgY = useTransform(y, [-300, 300], [-20, 20]);
  
  const float1X = useTransform(x, [-300, 300], [40, -40]);
  const float1Y = useTransform(y, [-300, 300], [40, -40]);
  
  const float2X = useTransform(x, [-300, 300], [-60, 60]);
  const float2Y = useTransform(y, [-300, 300], [-60, 60]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const filteredGames = useMemo(() => {
    return MOCK_GAMES.filter(game => {
      const matchesCategory = currentCategory === 'All' || game.category === currentCategory;
      const matchesSearch = !searchQuery || 
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [currentCategory, searchQuery]);

  const setCategory = (category: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (category === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      {!searchQuery && currentCategory === 'All' && (
        <section 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative h-[450px] sm:h-[600px] md:h-[750px] rounded-[32px] md:rounded-[48px] overflow-hidden group perspective-1000"
        >
          {/* Top Promo Bar */}
          <div className="absolute top-0 left-0 right-0 h-10 bg-orange-500 z-30 flex items-center overflow-hidden">
            <div className="flex items-center gap-12 animate-marquee-fast whitespace-nowrap">
              {[
                "Limited Time Offer: 20% Bonus on Honor of Kings", 
                "New Game Added: Zenless Zone Zero", 
                "Instant Delivery Guaranteed", 
                "Trusted by 1M+ Gamers Worldwide"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4 text-black font-black uppercase text-[10px] tracking-widest">
                  <Zap size={14} className="fill-current" />
                  {text}
                </div>
              ))}
              {/* Duplicate */}
              {[
                "Limited Time Offer: 20% Bonus on Honor of Kings", 
                "New Game Added: Zenless Zone Zero", 
                "Instant Delivery Guaranteed", 
                "Trusted by 1M+ Gamers Worldwide"
              ].map((text, i) => (
                <div key={`dup-${i}`} className="flex items-center gap-4 text-black font-black uppercase text-[10px] tracking-widest">
                  <Zap size={14} className="fill-current" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Background Image with Parallax */}
          <motion.div 
            style={{ 
              x: bgX,
              y: bgY,
              scale: 1.1 
            }}
            className="absolute inset-0"
          >
            <img 
              src="https://picsum.photos/seed/gaming-hero-2/1920/1080" 
              alt="Hero" 
              className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          {/* Layered Atmospheric Gradients */}
          <div className="absolute inset-0 bg-[#0a0a0a]/40 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
          
          {/* Background Decorative Marquee (Large Outline Text) */}
          <div className="absolute inset-0 flex flex-col justify-center pointer-events-none opacity-[0.03] select-none overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap text-[20vh] font-black uppercase italic leading-none">
              {Array(4).fill("GAMECHARGE TOPUP INSTANT SECURE ").map((text, i) => (
                <span key={i} style={{ WebkitTextStroke: '2px white', color: 'transparent' }}>{text}</span>
              ))}
            </div>
            <div className="flex animate-marquee-reverse whitespace-nowrap text-[20vh] font-black uppercase italic leading-none">
              {Array(4).fill("DOMINATE THE ARENA LEVEL UP ").map((text, i) => (
                <span key={i} style={{ WebkitTextStroke: '2px white', color: 'transparent' }}>{text}</span>
              ))}
            </div>
          </div>

          {/* Floating Decorative Elements with Parallax */}
          <motion.div 
            style={{ 
              x: float1X,
              y: float1Y,
              zIndex: 1
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 right-[25%] w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]"
          />
          <motion.div 
            style={{ 
              x: float2X,
              y: float2Y,
              zIndex: 1
            }}
            className="absolute bottom-40 right-[5%] w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"
          />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-center px-5 md:px-20 pt-12 pb-24 md:pt-16 md:pb-32 z-20">
            <motion.div
              style={{ rotateX, rotateY }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-4xl space-y-4 md:space-y-10"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-white/60 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                    Servers Online
                  </span>
                </div>
                <div className="h-px w-6 md:w-12 bg-white/10" />
                <div className="text-orange-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                  1.2M+ Transactions
                </div>
              </div>

              <div className="space-y-1 md:space-y-4">
                <h1 className="text-4xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] uppercase italic select-none">
                  <span className="block overflow-hidden">
                    <motion.span 
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="block"
                    >
                      Dominate
                    </motion.span>
                  </span>
                  <span className="block overflow-hidden">
                    <motion.span 
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300"
                    >
                      The Arena
                    </motion.span>
                  </span>
                </h1>
              </div>

              <p className="text-sm md:text-xl lg:text-2xl text-white/40 max-w-xl leading-relaxed font-medium">
                Premium top-ups for elite players. <br className="hidden sm:block" />
                <span className="text-white/80">Instant delivery, zero friction.</span>
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-10 pt-2">
                <button 
                  onClick={() => document.getElementById('games-grid')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group relative h-12 md:h-16 px-6 md:px-12 bg-orange-500 text-black font-black rounded-xl md:rounded-2xl hover:bg-orange-400 transition-all uppercase tracking-widest text-[10px] md:text-sm overflow-hidden flex items-center justify-center w-full sm:w-auto"
                >
                  <span className="relative z-10 flex items-center gap-2 md:gap-3">
                    Start Top-up
                    <Zap size={16} className="fill-current" />
                  </span>
                  <div className="absolute inset-0 bg-white/40 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
                
                <div className="flex items-center gap-6 md:gap-12">
                  <div className="space-y-0.5 md:space-y-1">
                    <div className="flex items-center gap-1.5 text-white/80">
                      <ShieldCheck size={14} className="text-orange-500" />
                      <span className="text-xs md:text-lg font-black">Secure</span>
                    </div>
                    <div className="text-[7px] md:text-[10px] font-bold text-white/20 uppercase tracking-widest">Encrypted Pay</div>
                  </div>
                  <div className="space-y-0.5 md:space-y-1">
                    <div className="flex items-center gap-1.5 text-white/80">
                      <Clock size={14} className="text-orange-500" />
                      <span className="text-xs md:text-lg font-black">Instant</span>
                    </div>
                    <div className="text-[7px] md:text-[10px] font-bold text-white/20 uppercase tracking-widest">Auto-Delivery</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Trust Bar - Refined with Double Marquee */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-[#0a0a0a]/90 backdrop-blur-2xl border-t border-white/5 flex flex-col justify-center overflow-hidden z-30">
            <div className="flex items-center gap-16 animate-marquee whitespace-nowrap mb-2">
              {[
                "Honor of Kings", "Clash of Clans", "Mobile Legends", "Genshin Impact", 
                "PUBG Mobile", "Free Fire", "Valorant", "Roblox"
              ].map((game) => (
                <div key={game} className="flex items-center gap-2 text-white/20 font-black uppercase text-[10px] tracking-[0.3em]">
                  <span className="w-1 h-1 bg-white/20 rounded-full" />
                  {game}
                </div>
              ))}
              {/* Duplicate */}
              {[
                "Honor of Kings", "Clash of Clans", "Mobile Legends", "Genshin Impact", 
                "PUBG Mobile", "Free Fire", "Valorant", "Roblox"
              ].map((game) => (
                <div key={`${game}-dup`} className="flex items-center gap-2 text-white/20 font-black uppercase text-[10px] tracking-[0.3em]">
                  <span className="w-1 h-1 bg-white/20 rounded-full" />
                  {game}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-16 animate-marquee-reverse whitespace-nowrap">
              {[
                "Instant Delivery", "Secure Payment", "24/7 Support", "Best Prices",
                "Official Partner", "No Hidden Fees", "Global Access", "Elite Service"
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-orange-500/20 font-black uppercase text-[10px] tracking-[0.3em]">
                  <span className="w-1 h-1 bg-orange-500/20 rounded-full" />
                  {feature}
                </div>
              ))}
              {/* Duplicate */}
              {[
                "Instant Delivery", "Secure Payment", "24/7 Support", "Best Prices",
                "Official Partner", "No Hidden Fees", "Global Access", "Elite Service"
              ].map((feature) => (
                <div key={`${feature}-dup`} className="flex items-center gap-2 text-orange-500/20 font-black uppercase text-[10px] tracking-[0.3em]">
                  <span className="w-1 h-1 bg-orange-500/20 rounded-full" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Games Grid */}
      <section id="games-grid" className="px-1 md:px-0">
        {/* Recent Searches */}
        <AnimatePresence>
          {recentSearches.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <button 
                onClick={() => setIsRecentSearchesOpen(!isRecentSearchesOpen)}
                className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors mb-4 group"
              >
                <Clock size={14} className="group-hover:text-orange-500 transition-colors" />
                Recent Searches
                <ChevronDown size={14} className={`transition-transform duration-300 ${isRecentSearchesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isRecentSearchesOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-2 items-center">
                      {recentSearches.map((search, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            const newParams = new URLSearchParams(searchParams);
                            newParams.set('q', search);
                            setSearchParams(newParams);
                          }}
                          className="px-3 py-1.5 md:px-4 md:py-2 bg-white/5 border border-white/10 rounded-xl text-xs md:text-sm hover:border-orange-500/50 hover:bg-orange-500/5 transition-all flex items-center gap-2 group"
                        >
                          <span className="max-w-[120px] truncate">{search}</span>
                          <Search size={12} className="text-white/20 group-hover:text-orange-500 transition-colors shrink-0" />
                        </button>
                      ))}
                      <button 
                        onClick={() => {
                          setRecentSearches([]);
                          localStorage.removeItem('recent_searches');
                        }}
                        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-red-500/40 hover:text-red-500 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-3 md:gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">
              {searchQuery ? `Search results for "${searchQuery}"` : 'Popular Games'}
            </h2>
            {currentCategory !== 'All' && (
              <p className="text-[10px] md:text-xs font-bold text-orange-500 uppercase tracking-widest mt-0.5 md:mt-1">
                Category: {currentCategory}
              </p>
            )}
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {['All', 'MOBA', 'RPG', 'FPS', 'Strategy', 'Battle Royale'].map((cat) => (
              <button 
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold border transition-all uppercase tracking-widest whitespace-nowrap ${
                  currentCategory === cat 
                    ? 'bg-orange-500 border-orange-500 text-black' 
                    : 'border-white/10 text-white/40 hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="skeleton-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6"
            >
              {Array(10).fill(0).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[3/4] rounded-[2rem]" />
                  <div className="space-y-2 px-2">
                    <Skeleton height={12} width="40%" />
                    <Skeleton height={20} width="80%" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : filteredGames.length > 0 ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6"
            >
              {filteredGames.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GameCard game={game} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="py-20 text-center space-y-6"
            >
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                <SearchX size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">No matches found</h3>
                <p className="text-white/40 max-w-xs mx-auto">
                  We couldn't find any games matching <span className="text-orange-500 font-mono">"{searchQuery}"</span>. 
                  Try a different keyword or browse by category.
                </p>
              </div>
              <button 
                onClick={() => {
                  setSearchParams({});
                }}
                className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl text-orange-500 font-bold uppercase text-xs tracking-[0.2em] hover:bg-orange-500 hover:text-black hover:border-orange-500 transition-all"
              >
                Reset Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
