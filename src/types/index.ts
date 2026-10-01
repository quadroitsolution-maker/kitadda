export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  compare_at_price: number;
  category: "player-version" | "fan-version" | "world-cup" | "accessories" | "club" | "retro" | "international" | "jackets";
  image_url: string;
  gallery: string[];
  stock_status: "in_stock" | "low_stock" | "out_of_stock";
  team: string;
  league: string;
  season: string;
  badge?: string;
  is_featured?: boolean;
  version_type?: "Fan Version" | "Player Version";
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
  customizations: {
    version: string;
    product_title: string;
    product_image: string;
  };
}

export interface OrderRecord {
  id: string;
  user_id?: string | null;
  total_amount: number;
  payment_status: "pending" | "paid" | "failed";
  razorpay_order_id: string;
  razorpay_payment_id?: string | null;
  shipping_address: ShippingAddress;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  created_at: string;
}
