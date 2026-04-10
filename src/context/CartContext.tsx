import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Game, ProductItem, CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (game: Game, product: ProductItem, playerId: string, serverId?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('gamecharge_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('gamecharge_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (game: Game, product: ProductItem, playerId: string, serverId?: string) => {
    const newItem: CartItem = {
      id: Math.random().toString(36).substr(2, 9),
      game,
      product,
      playerId,
      serverId
    };
    setCart(prev => [...prev, newItem]);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
