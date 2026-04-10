import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Game, Review } from '../types';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'reviews'), where('gameId', '==', game.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviews = snapshot.docs.map(doc => doc.data() as Review);
      if (reviews.length > 0) {
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        setAvgRating(sum / reviews.length);
        setReviewCount(reviews.length);
      } else {
        setAvgRating(null);
        setReviewCount(0);
      }
    });
    return () => unsubscribe();
  }, [game.id]);

  return (
    <motion.div
      whileHover={{ y: -12 }}
      className="group relative bg-[#1a1a1a] rounded-[2rem] overflow-hidden border border-white/5 hover:border-orange-500/50 transition-all duration-500 shadow-2xl"
    >
      <Link to={`/game/${game.id}`}>
        <div className="aspect-[3/4] overflow-hidden relative">
          <img 
            src={game.imageUrl} 
            alt={game.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
          
          {/* Rating Badge */}
          {avgRating !== null && (
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg flex items-center gap-1 z-10">
              <Star size={12} className="text-orange-500 fill-orange-500" />
              <span className="text-[10px] font-black text-white">{avgRating.toFixed(1)}</span>
            </div>
          )}

          {/* Hover Overlay Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
            <div className="bg-orange-500 text-black font-black uppercase tracking-widest text-[10px] px-6 py-3 rounded-full shadow-[0_0_30px_rgba(249,115,22,0.5)]">
              Top-up Now
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 transform group-hover:-translate-y-2 transition-transform duration-500">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500/80">
                {game.category}
              </span>
            </div>
            {reviewCount > 0 && (
              <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
                {reviewCount} Reviews
              </span>
            )}
          </div>
          <h3 className="text-xl font-black leading-tight group-hover:text-orange-500 transition-colors uppercase italic tracking-tighter">
            {game.name}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
}
