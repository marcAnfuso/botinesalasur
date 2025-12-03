export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          brand: string;
          description: string;
          price: number;
          category: "futsal" | "sintetico" | "futbol11" | "accesorios";
          image_url: string;
          images: string[] | null;
          featured: boolean;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          brand: string;
          description: string;
          price: number;
          category: "futsal" | "sintetico" | "futbol11" | "accesorios";
          image_url: string;
          images?: string[] | null;
          featured?: boolean;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          brand?: string;
          description?: string;
          price?: number;
          category?: "futsal" | "sintetico" | "futbol11" | "accesorios";
          image_url?: string;
          images?: string[] | null;
          featured?: boolean;
          active?: boolean;
          updated_at?: string;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          size: string;
          stock: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          size: string;
          stock?: number;
          created_at?: string;
        };
        Update: {
          size?: string;
          stock?: number;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          shipping_address: string;
          shipping_city: string;
          shipping_province: string;
          shipping_postal_code: string;
          shipping_zone: "gba-sur" | "otro";
          shipping_cost: number;
          subtotal: number;
          total: number;
          status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
          notes: string | null;
          mp_payment_id: string | null;
          mp_preference_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          shipping_address: string;
          shipping_city: string;
          shipping_province: string;
          shipping_postal_code: string;
          shipping_zone: "gba-sur" | "otro";
          shipping_cost: number;
          subtotal: number;
          total: number;
          status?: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
          notes?: string | null;
          mp_payment_id?: string | null;
          mp_preference_id?: string | null;
        };
        Update: {
          status?: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
          mp_payment_id?: string | null;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          variant_id: string;
          product_name: string;
          product_brand: string;
          variant_size: string;
          quantity: number;
          unit_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          variant_id: string;
          product_name: string;
          product_brand: string;
          variant_size: string;
          quantity: number;
          unit_price: number;
        };
        Update: never;
      };
    };
  };
}

// Tipos auxiliares
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
export type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
export type ProductVariantInsert = Database["public"]["Tables"]["product_variants"]["Insert"];

export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];

export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type OrderItemInsert = Database["public"]["Tables"]["order_items"]["Insert"];
