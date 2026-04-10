export interface Game {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  playerFieldLabel: string;
  serverFieldLabel?: string;
}

export interface ProductItem {
  id: string;
  gameId: string;
  name: string;
  price: number;
  value: number;
}

export interface Transaction {
  id?: string;
  gameId: string;
  productId: string;
  playerId: string;
  serverId?: string;
  email?: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  timestamp: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

export interface CartItem {
  id: string;
  game: Game;
  product: ProductItem;
  playerId: string;
  serverId?: string;
}

export interface Review {
  id?: string;
  gameId: string;
  rating: number;
  comment?: string;
  userName: string;
  timestamp: string;
}
