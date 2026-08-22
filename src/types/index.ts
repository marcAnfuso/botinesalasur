export interface ProductVariant {
  id: string;
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  category: "futsal" | "sintetico" | "futbol11" | "accesorios";
  imageUrl: string;
  images?: string[];
  featured: boolean;
  active: boolean;
  variants: ProductVariant[];
  createdAt: string;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  shippingZone: "gba-sur" | "otro";
  notes?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  customer: CustomerInfo;
  total: number;
  shippingCost: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  mpPaymentId?: string;
  createdAt: string;
}

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

// ===== Pedidos (panel admin) =====

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface AdminOrderItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  productBrand: string;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface AdminOrder {
  id: string;
  externalReference: string | null;
  customer: CustomerInfo;
  items: AdminOrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  mpPaymentId: string | null;
  paidAt: string | null;
  createdAt: string;
}
