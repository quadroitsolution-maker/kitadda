export type ProductCategory = 
  | "player-version" 
  | "fan-version" 
  | "world-cup" 
  | "accessories" 
  | "club" 
  | "retro" 
  | "international" 
  | "jackets";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";
export type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Product {
  id: string;
  sku?: string;
  title: string;
  description: string;
  price: number;
  compare_at_price: number;
  category: ProductCategory;
  image_url: string;
  gallery: string[];
  stock_status: StockStatus;
  stock_quantity?: number;
  team: string;
  league: string;
  season: string;
  badge?: string;
  is_featured?: boolean;
  version_type?: "Fan Version" | "Player Version";
  sizes?: ("S" | "M" | "L" | "XL" | "XXL")[];
  created_at?: string;
  updated_at?: string;
}

export interface CustomizationDetails {
  custom_name: string;
  custom_number: string;
  patches: boolean;
  selected_patch_type?: string;
}

export interface CartItem {
  cart_item_id: string;
  product: Product;
  size: "S" | "M" | "L" | "XL" | "XXL";
  version: "Fan Version" | "Player Version";
  custom_name: string;
  custom_number: string;
  patches: boolean;
  patch_fee: number;
  unit_price: number;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItemRecord {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  size: string;
  custom_name: string | null;
  custom_number: string | null;
  patches: boolean;
  customizations?: {
    version?: string;
    product_title?: string;
    product_image?: string;
  };
}

export interface OrderRecord {
  id: string;
  user_id?: string | null;
  total_amount: number;
  payment_status: PaymentStatus;
  payment_method?: "razorpay";
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
  shipping_address: ShippingAddress;
  status: OrderStatus;
  items?: CartItem[];
  created_at: string;
  updated_at?: string;
}

export interface HeroSlide {
  id: string;
  badge: string;
  headline: string;
  description: string;
  cta_link: string;
  image_url: string;
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type CouponDiscountType = "percentage" | "fixed" | "free_shipping";

export interface Coupon {
  id: string;
  code: string;
  discount_type: CouponDiscountType;
  discount_value: number; // e.g. 10 (for 10%), 100 (for ₹100), 0 (for free shipping)
  min_order_amount?: number;
  max_discount_amount?: number;
  is_active: boolean;
  description?: string;
  expires_at?: string;
  usage_count?: number;
  created_at?: string;
}


