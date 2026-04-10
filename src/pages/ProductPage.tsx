import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Game, ProductItem, PaymentMethod, Review } from '../types';
import Skeleton from '../components/Skeleton';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ChevronRight, ChevronLeft, CreditCard, Wallet, Landmark, Mail, Info, AlertCircle, ShoppingCart, Check, Zap, Star, MessageSquare, Send, User, ShieldCheck } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

interface FormErrors {
  playerId?: string;
  serverId?: string;
  product?: string;
  payment?: string;
  email?: string;
  checkout?: string;
}

const MOCK_GAMES: Record<string, Game> = {
  'honor-of-kings': {
    id: 'honor-of-kings',
    name: 'Honor of Kings',
    category: 'MOBA',
    imageUrl: 'https://picsum.photos/seed/hok/600/800',
    playerFieldLabel: 'Player ID',
  },
  'clash-of-clans': {
    id: 'clash-of-clans',
    name: 'Clash of Clans',
    category: 'Strategy',
    imageUrl: 'https://picsum.photos/seed/coc/600/800',
    playerFieldLabel: 'Player Tag',
  },
  'mobile-legends': {
    id: 'mobile-legends',
    name: 'Mobile Legends',
    category: 'MOBA',
    imageUrl: 'https://picsum.photos/seed/mlbb/600/800',
    playerFieldLabel: 'User ID',
    serverFieldLabel: 'Zone ID',
  }
};

const MOCK_PRODUCTS: ProductItem[] = [
  { id: 'p1', gameId: 'honor-of-kings', name: '80 Tokens', price: 50, value: 80 },
  { id: 'p2', gameId: 'honor-of-kings', name: '240 Tokens', price: 150, value: 240 },
  { id: 'p3', gameId: 'honor-of-kings', name: '400 Tokens', price: 250, value: 400 },
  { id: 'p4', gameId: 'honor-of-kings', name: '800 Tokens', price: 500, value: 800 },
  { id: 'p5', gameId: 'honor-of-kings', name: '1600 Tokens', price: 1000, value: 1600 },
  { id: 'p6', gameId: 'honor-of-kings', name: '4000 Tokens', price: 2500, value: 4000 },
];

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'gcash', name: 'GCash', icon: 'Wallet' },
  { id: 'maya', name: 'Maya', icon: 'Wallet' },
  { id: 'grabpay', name: 'GrabPay', icon: 'Wallet' },
  { id: 'bank', name: 'Bank Transfer', icon: 'Landmark' },
  { id: 'card', name: 'Credit/Debit Card', icon: 'CreditCard' },
];

export default function ProductPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [game, setGame] = useState<Game | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Form State
  const [playerId, setPlayerId] = useState('');
  const [serverId, setServerId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasPurchased, setHasPurchased] = useState(false);

  // Review State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewUserName, setReviewUserName] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (!gameId) return;
    const q = query(
      collection(db, 'reviews'),
      where('gameId', '==', gameId),
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      setReviews(docs);
    });
    return () => unsubscribe();
  }, [gameId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewUserName.trim()) {
      toast.error('Please enter your name to leave a review.');
      return;
    }
    setIsSubmittingReview(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        gameId,
        rating: reviewRating,
        comment: reviewComment,
        userName: reviewUserName,
        timestamp: new Date().toISOString(),
        createdAt: serverTimestamp()
      });
      setReviewComment('');
      setReviewUserName('');
      setReviewRating(5);
      toast.success('Review submitted successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsInitialLoading(true);
      
      // Check if user has purchased this game before
      const purchased = localStorage.getItem('purchased_games');
      if (purchased) {
        try {
          const games = JSON.parse(purchased);
          if (Array.isArray(games) && games.includes(gameId)) {
            setHasPurchased(true);
          }
        } catch (e) {
          console.error('Failed to parse purchased games', e);
        }
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (gameId && MOCK_GAMES[gameId]) {
        setGame(MOCK_GAMES[gameId]);
        setProducts(MOCK_PRODUCTS.filter(p => p.gameId === gameId));
      } else {
        // Fallback for demo if ID not in mock
        setGame({
          id: gameId || 'unknown',
          name: gameId?.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || 'Game',
          category: 'Gaming',
          imageUrl: `https://picsum.photos/seed/${gameId}/600/800`,
          playerFieldLabel: 'Player ID',
        });
        setProducts(MOCK_PRODUCTS);
      }
      setIsInitialLoading(false);
    };

    loadData();
  }, [gameId]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!playerId.trim()) {
      newErrors.playerId = `Please enter your ${game?.playerFieldLabel} to continue.`;
    } else if (playerId.length < 4) {
      newErrors.playerId = `Your ${game?.playerFieldLabel} seems too short. Please double-check it.`;
    }

    if (game?.serverFieldLabel && !serverId.trim()) {
      newErrors.serverId = `Please enter your ${game.serverFieldLabel}.`;
    }

    if (!selectedProduct) {
      newErrors.product = 'Please select a top-up amount from the options above.';
    }

    if (!selectedPayment) {
      newErrors.payment = 'Please choose a payment method to proceed with the transaction.';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'This email format looks incorrect. Please check for typos.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = () => {
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  const confirmCheckout = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    setErrors({});

    const path = 'transactions';
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Record transaction in Firestore
      const docRef = await addDoc(collection(db, path), {
        gameId: game?.id,
        productId: selectedProduct?.id,
        playerId,
        serverId,
        email,
        amount: selectedProduct?.price,
        status: 'completed',
        paymentMethod: selectedPayment?.id,
        timestamp: new Date().toISOString(),
        createdAt: serverTimestamp()
      });

      // Mark as purchased in localStorage
      const purchased = localStorage.getItem('purchased_games');
      let purchasedList = [];
      if (purchased) {
        try {
          purchasedList = JSON.parse(purchased);
        } catch (e) {}
      }
      if (!purchasedList.includes(game?.id)) {
        purchasedList.push(game?.id);
        localStorage.setItem('purchased_games', JSON.stringify(purchasedList));
      }

      // Store details for success page
      localStorage.setItem('last_transaction_amount', selectedProduct?.price.toString() || '0');
      localStorage.setItem('last_payment_method', selectedPayment?.name || '');

      // Success!
      navigate(`/success/${docRef.id}`);
    } catch (err) {
      console.error(err);
      try {
        handleFirestoreError(err, OperationType.WRITE, path);
      } catch (firestoreErr: any) {
        try {
          const errData = JSON.parse(firestoreErr.message);
          let userMessage = "We couldn't process your transaction right now.";
          
          if (errData.error.includes('permission-denied')) {
            userMessage = "Payment authorization failed. Please check your payment details or try a different method.";
          } else if (errData.error.includes('quota-exceeded')) {
            userMessage = "Our servers are currently busy. Please try again in a few minutes.";
          } else if (errData.error.includes('offline')) {
            userMessage = "You appear to be offline. Please check your internet connection.";
          }

          setErrors({ checkout: userMessage });
        } catch (e) {
          setErrors({ checkout: "Something went wrong. Please refresh the page and try again." });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitialLoading || !game) {
    return (
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 opacity-20">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
            <ChevronLeft size={18} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">Back to Games</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-[#1a1a1a] rounded-[2rem] overflow-hidden border border-white/5">
            <Skeleton className="aspect-[3/4] w-full" />
            <div className="p-6 md:p-10 space-y-4">
              <Skeleton height={32} width="80%" />
              <Skeleton height={16} width="40%" />
              <div className="pt-6 space-y-4">
                <Skeleton height={60} className="rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton height={12} width="30%" />
                  <div className="space-y-2">
                    <Skeleton height={16} />
                    <Skeleton height={16} />
                    <Skeleton height={16} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-2 space-y-8">
          {[1, 2, 3, 4].map((i) => (
            <section key={i} className="bg-[#1a1a1a] rounded-[2rem] p-6 md:p-10 border border-white/5 space-y-6">
              <div className="flex items-center gap-6">
                <Skeleton width={48} height={48} className="rounded-2xl" />
                <Skeleton width={200} height={32} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array(6).fill(0).map((_, j) => (
                  <Skeleton key={j} height={80} className="rounded-2xl" />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-white/40 hover:text-orange-500 transition-colors group"
      >
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-orange-500/10 transition-colors">
          <ChevronLeft size={18} />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest">Back to Games</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                    <Info className="text-orange-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter">Confirm Purchase</h3>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Please review your order</p>
                  </div>
                </div>

                <div className="space-y-4 bg-white/5 rounded-2xl p-5 border border-white/5">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/40 text-xs uppercase font-bold tracking-widest">Game</span>
                      <span className="font-bold text-sm">{game.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/40 text-xs uppercase font-bold tracking-widest">Item</span>
                      <span className="font-bold text-sm text-orange-500">{selectedProduct?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/40 text-xs uppercase font-bold tracking-widest">{game.playerFieldLabel}</span>
                      <span className="font-mono text-sm">{playerId}</span>
                    </div>
                    {serverId && (
                      <div className="flex justify-between items-center">
                        <span className="text-white/40 text-xs uppercase font-bold tracking-widest">{game.serverFieldLabel}</span>
                        <span className="font-mono text-sm">{serverId}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-white/40 text-xs uppercase font-bold tracking-widest">Payment</span>
                      <span className="font-bold text-sm">{selectedPayment?.name}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                    <span className="text-xs font-black uppercase tracking-widest">Total Amount</span>
                    <span className="text-2xl font-black text-orange-500">₱{selectedProduct?.price.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={confirmCheckout}
                    className="w-full py-4 bg-orange-500 text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/20"
                  >
                    Confirm & Pay
                  </button>
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="w-full py-4 bg-white/5 text-white/60 font-black uppercase tracking-widest text-sm rounded-xl hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Left Column: Game Info */}
      <div className="lg:col-span-1 space-y-4 md:space-y-6">
        <div className="bg-[#1a1a1a] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-white/5 sticky top-24 shadow-2xl">
          <div className="relative aspect-[3/4]">
            <img 
              src={game.imageUrl} 
              alt={game.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6">
              <div className="flex items-center gap-2 mb-1 md:mb-2">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-orange-500 rounded-full animate-pulse" />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Official Partner</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter leading-none">{game.name}</h1>
            </div>
          </div>
          <div className="p-5 md:p-8 space-y-6 md:space-y-8">
            <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/5">
              <Zap size={20} className="text-orange-500 shrink-0 md:w-6 md:h-6" />
              <div>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white">Instant Delivery</p>
                <p className="text-[8px] md:text-[10px] text-white/40">Automated processing 24/7</p>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <h4 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white/20 border-b border-white/5 pb-1 md:pb-2">How to top up</h4>
              <div className="space-y-3 md:space-y-4">
                {[
                  { step: 1, text: `Enter your ${game.playerFieldLabel}` },
                  { step: 2, text: "Select the recharge amount" },
                  { step: 3, text: "Choose your payment method" },
                  { step: 4, text: "Receive your items instantly" }
                ].map((item) => (
                  <div key={item.step} className="flex gap-3 md:gap-4">
                    <span className="text-orange-500 font-black italic text-xs md:text-sm">0{item.step}</span>
                    <p className="text-xs md:text-sm text-white/60 font-medium leading-tight">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Steps */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Step 1: User ID */}
        <section className="bg-[#1a1a1a] rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 border border-white/5 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 w-1 h-full md:w-1.5 bg-orange-500"></div>
          <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-orange-500 text-black flex items-center justify-center font-black text-lg md:text-xl italic shadow-[0_0_20px_rgba(249,115,22,0.3)]">01</div>
            <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">Enter User Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/40">{game.playerFieldLabel}</label>
              <input 
                type="text" 
                value={playerId}
                disabled={isSubmitting}
                onChange={(e) => {
                  setPlayerId(e.target.value);
                  if (errors.playerId) setErrors({ ...errors, playerId: undefined });
                }}
                placeholder={`Enter ${game.playerFieldLabel}`}
                className={`w-full bg-white/5 border rounded-xl px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base outline-none transition-colors ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  errors.playerId ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-orange-500'
                }`}
              />
              {errors.playerId && (
                <p className="text-[10px] md:text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle size={10} className="md:w-3 md:h-3" />
                  {errors.playerId}
                </p>
              )}
            </div>
            {game.serverFieldLabel && (
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/40">{game.serverFieldLabel}</label>
                <input 
                  type="text" 
                  value={serverId}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    setServerId(e.target.value);
                    if (errors.serverId) setErrors({ ...errors, serverId: undefined });
                  }}
                  placeholder={`Enter ${game.serverFieldLabel}`}
                  className={`w-full bg-white/5 border rounded-xl px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base outline-none transition-colors ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    errors.serverId ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-orange-500'
                  }`}
                />
                {errors.serverId && (
                  <p className="text-[10px] md:text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={10} className="md:w-3 md:h-3" />
                    {errors.serverId}
                  </p>
                )}
              </div>
            )}
          </div>
          <p className="mt-3 md:mt-4 text-[10px] md:text-xs text-white/30">
            To find your {game.playerFieldLabel}, click on your profile icon in the top left corner of the main game screen.
          </p>
        </section>

        {/* Step 2: Denominations */}
        <section className="bg-[#1a1a1a] rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 border border-white/5 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 w-1 h-full md:w-1.5 bg-orange-500"></div>
          <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-orange-500 text-black flex items-center justify-center font-black text-lg md:text-xl italic shadow-[0_0_20px_rgba(249,115,22,0.3)]">02</div>
            <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">Select Recharge Amount</h2>
          </div>
          
          <div className="relative">
            <AnimatePresence mode="wait">
              {isInitialLoading ? (
                <motion.div 
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4"
                >
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-24 md:h-32 bg-white/5 rounded-xl md:rounded-2xl animate-pulse border border-white/5" />
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4"
                >
                  {products.map((product, index) => (
                    <button
                      key={product.id}
                      disabled={isSubmitting}
                      onClick={() => {
                        setSelectedProduct(product);
                        if (errors.product) setErrors({ ...errors, product: undefined });
                      }}
                      className={`relative p-3 md:p-5 rounded-xl md:rounded-2xl border-2 transition-all text-left group overflow-hidden h-full flex flex-col justify-between ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                      } ${
                        selectedProduct?.id === product.id 
                          ? 'bg-orange-500/10 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.15)]' 
                          : errors.product ? 'bg-red-500/5 border-red-500/30' : 'bg-white/5 border-white/10 hover:border-orange-500/50'
                      }`}
                    >
                      {index === 2 && (
                        <div className="absolute top-0 right-0 bg-orange-500 text-black text-[7px] md:text-[8px] font-black px-1.5 py-0.5 md:px-2 md:py-1 rounded-bl-lg uppercase tracking-widest z-10">
                          Popular
                        </div>
                      )}
                      {index === products.length - 1 && (
                        <div className="absolute top-0 right-0 bg-white text-black text-[7px] md:text-[8px] font-black px-1.5 py-0.5 md:px-2 md:py-1 rounded-bl-lg uppercase tracking-widest z-10">
                          Best Value
                        </div>
                      )}
                      
                      <div className="space-y-0.5 md:space-y-1">
                        <div className={`font-black text-base md:text-xl transition-colors ${selectedProduct?.id === product.id ? 'text-orange-500' : 'text-white'}`}>
                          {product.name}
                        </div>
                        <div className="text-[9px] md:text-xs text-white/40 font-bold uppercase tracking-widest">
                          {product.value} {game?.name.split(' ').pop()}
                        </div>
                      </div>

                      <div className="mt-3 md:mt-4 flex items-center justify-between">
                        <div className={`text-sm md:text-lg font-black ${selectedProduct?.id === product.id ? 'text-white' : 'text-white/60'}`}>
                          ₱{product.price.toLocaleString()}
                        </div>
                        <AnimatePresence>
                          {selectedProduct?.id === product.id && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                            >
                              <CheckCircle2 size={16} className="text-orange-500 md:w-5 md:h-5" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {selectedProduct?.id === product.id && (
                        <motion.div 
                          layoutId="product-active-bg"
                          className="absolute inset-0 bg-orange-500/5 pointer-events-none"
                        />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Checkout Processing Overlay */}
            <AnimatePresence>
              {isSubmitting && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#1a1a1a]/60 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-2xl"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Processing Selection</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {errors.product && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-4">
              <AlertCircle size={12} />
              {errors.product}
            </p>
          )}
        </section>

        {/* Step 3: Payment */}
        <section className="bg-[#1a1a1a] rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 border border-white/5 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 w-1 h-full md:w-1.5 bg-orange-500"></div>
          <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-orange-500 text-black flex items-center justify-center font-black text-lg md:text-xl italic shadow-[0_0_20px_rgba(249,115,22,0.3)]">03</div>
            <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">Select Payment Method</h2>
          </div>
          
          <div className="relative">
            <AnimatePresence mode="wait">
              {isInitialLoading ? (
                <motion.div 
                  key="skeleton-payment"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3"
                >
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 md:h-20 bg-white/5 rounded-xl md:rounded-2xl animate-pulse border border-white/5" />
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="content-payment"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      disabled={isSubmitting}
                      onClick={() => {
                        setSelectedPayment(method);
                        if (errors.payment) setErrors({ ...errors, payment: undefined });
                      }}
                      className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all relative overflow-hidden group ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                      } ${
                        selectedPayment?.id === method.id 
                          ? 'bg-orange-500/10 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.1)]' 
                          : errors.payment ? 'bg-red-500/5 border-red-500/30' : 'bg-white/5 border-white/10 hover:border-orange-500/50'
                      }`}
                    >
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                        selectedPayment?.id === method.id 
                          ? 'bg-orange-500 text-black scale-110' 
                          : 'bg-white/5 text-white/40 group-hover:text-white'
                      }`}>
                        {method.icon === 'Wallet' && <Wallet size={20} className="md:w-6 md:h-6" />}
                        {method.icon === 'Landmark' && <Landmark size={20} className="md:w-6 md:h-6" />}
                        {method.icon === 'CreditCard' && <CreditCard size={20} className="md:w-6 md:h-6" />}
                      </div>
                      
                      <div className="flex-1 text-left">
                        <div className={`text-sm md:text-base font-black uppercase tracking-tight transition-colors ${selectedPayment?.id === method.id ? 'text-orange-500' : 'text-white'}`}>
                          {method.name}
                        </div>
                        <div className="text-[8px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest">
                          Instant Delivery
                        </div>
                      </div>

                      <AnimatePresence>
                        {selectedPayment?.id === method.id && (
                          <motion.div
                            initial={{ scale: 0, x: 10 }}
                            animate={{ scale: 1, x: 0 }}
                            exit={{ scale: 0, x: 10 }}
                            className="shrink-0"
                          >
                            <CheckCircle2 size={20} className="text-orange-500 md:w-6 md:h-6" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {selectedPayment?.id === method.id && (
                        <motion.div 
                          layoutId="payment-active-bg"
                          className="absolute inset-0 bg-orange-500/5 pointer-events-none"
                        />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Checkout Processing Overlay */}
            <AnimatePresence>
              {isSubmitting && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#1a1a1a]/60 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-2xl"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Verifying Payment</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {errors.payment && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-4">
              <AlertCircle size={12} />
              {errors.payment}
            </p>
          )}
        </section>

        {/* Step 4: Email & Checkout */}
        <section className="bg-[#1a1a1a] rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 border border-white/5 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 w-1 h-full md:w-1.5 bg-orange-500"></div>
          <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-orange-500 text-black flex items-center justify-center font-black text-lg md:text-xl italic shadow-[0_0_20px_rgba(249,115,22,0.3)]">04</div>
            <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">Buy Now</h2>
          </div>
          <div className="space-y-4 md:space-y-6">
            {/* Order Summary */}
            {(selectedProduct || selectedPayment || playerId) && (
              <div className="bg-white/5 rounded-xl md:rounded-2xl p-4 md:p-5 border border-white/5 space-y-3 md:space-y-4">
                <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/40 border-b border-white/5 pb-1.5 md:pb-2">Order Summary</h3>
                <div className="space-y-1.5 md:space-y-2">
                  {playerId && (
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-white/40">{game.playerFieldLabel}</span>
                      <span className="font-mono text-orange-500">{playerId}</span>
                    </div>
                  )}
                  {selectedProduct && (
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-white/40">Item</span>
                      <span className="font-medium">{selectedProduct.name}</span>
                    </div>
                  )}
                  {selectedPayment && (
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-white/40">Payment</span>
                      <span className="font-medium">{selectedPayment.name}</span>
                    </div>
                  )}
                </div>
                {selectedProduct && (
                  <div className="pt-3 md:pt-4 border-t border-white/5 flex justify-between items-end">
                    <span className="text-xs md:text-sm font-bold uppercase tracking-tight">Total Price</span>
                    <span className="text-xl md:text-2xl font-black text-orange-500">₱{selectedProduct.price.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Mail size={12} className="md:w-3.5 md:h-3.5" />
                Email Address (Optional)
              </label>
              <input 
                type="email" 
                value={email}
                disabled={isSubmitting}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                placeholder="Enter email for receipt"
                className={`w-full bg-white/5 border rounded-xl px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base outline-none transition-colors ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  errors.email ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-orange-500'
                }`}
              />
              {errors.email ? (
                <p className="text-[10px] md:text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle size={10} className="md:w-3 md:h-3" />
                  {errors.email}
                </p>
              ) : (
                <p className="text-[9px] md:text-[10px] text-white/20">We will send a digital receipt to this email address.</p>
              )}
            </div>

            {errors.checkout && (
              <div className="p-3 md:p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-xs md:text-sm font-medium flex items-start gap-2 md:gap-3">
                <AlertCircle size={16} className="shrink-0 mt-0.5 md:w-[18px] md:h-[18px]" />
                {errors.checkout}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <button
                onClick={() => {
                  if (validateForm() && game && selectedProduct) {
                    addToCart(game, selectedProduct, playerId, serverId);
                    toast.success('Added to cart', {
                      description: `${selectedProduct.name} for ${game.name}`,
                      icon: <Check className="text-green-500" size={16} />,
                      duration: 4000,
                    });
                  }
                }}
                disabled={isSubmitting}
                className={`py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-base md:text-lg flex items-center justify-center gap-2 md:gap-3 transition-all border-2 ${
                  isSubmitting 
                    ? 'border-white/5 text-white/20 cursor-not-allowed' 
                    : 'border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black'
                }`}
              >
                <ShoppingCart size={18} className="md:w-5 md:h-5" />
                Add to Cart
              </button>
              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className={`py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-base md:text-lg flex items-center justify-center gap-2 md:gap-3 transition-all ${
                  isSubmitting 
                    ? 'bg-white/10 text-white/40 cursor-not-allowed' 
                    : 'bg-orange-500 text-black hover:bg-orange-400 shadow-lg shadow-orange-500/20'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Buy Now
                    <ChevronRight size={18} className="md:w-5 md:h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Step 5: Reviews */}
        <section className="bg-[#1a1a1a] rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 border border-white/5 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 w-1 h-full md:w-1.5 bg-orange-500"></div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-orange-500 text-black flex items-center justify-center font-black text-lg md:text-xl italic shadow-[0_0_20px_rgba(249,115,22,0.3)]">05</div>
              <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">User Reviews</h2>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <Star size={16} className="text-orange-500 fill-orange-500" />
              <span className="text-sm font-black">
                {reviews.length > 0 
                  ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                  : '0.0'}
              </span>
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">({reviews.length})</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Review Form */}
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">Leave a Review</h3>
              
              {hasPurchased ? (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Your Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                      <input 
                        type="text"
                        value={reviewUserName}
                        onChange={(e) => setReviewUserName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="transition-transform active:scale-90"
                        >
                          <Star 
                            size={24} 
                            className={star <= reviewRating ? "text-orange-500 fill-orange-500" : "text-white/10"} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Comment (Optional)</label>
                    <textarea 
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-orange-500 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-orange-500 hover:text-black hover:border-orange-500 transition-all disabled:opacity-50"
                  >
                    {isSubmittingReview ? (
                      <div className="w-4 h-4 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={14} />
                        Submit Review
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="bg-white/5 border border-white/5 rounded-2xl p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheck size={32} className="text-orange-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-black uppercase tracking-widest">Verified Purchase Required</p>
                    <p className="text-[10px] text-white/40 leading-relaxed">
                      To ensure high-quality feedback, only users who have successfully topped up for this game can leave a review.
                    </p>
                  </div>
                  <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-colors"
                  >
                    Top-up now to unlock reviews
                  </button>
                </div>
              )}
            </div>

            {/* Review List */}
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">Recent Feedback</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {reviews.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-12 text-center opacity-20"
                    >
                      <MessageSquare size={48} className="mx-auto mb-4" />
                      <p className="text-sm font-bold uppercase tracking-widest">No reviews yet</p>
                      <p className="text-[10px] mt-1">Be the first to share your experience!</p>
                    </motion.div>
                  ) : (
                    reviews.map((review) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center">
                              <User size={14} className="text-orange-500" />
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase tracking-tight">{review.userName}</p>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star 
                                    key={s} 
                                    size={8} 
                                    className={s <= review.rating ? "text-orange-500 fill-orange-500" : "text-white/10"} 
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
                            {new Date(review.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-xs text-white/60 leading-relaxed italic">"{review.comment}"</p>
                        )}
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  </div>
  );
}
