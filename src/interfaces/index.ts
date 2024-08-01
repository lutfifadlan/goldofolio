export interface GoldBuyingPrice {
  Gram: string;
  'Antam per Batangan (Rp)': string;
  'Antam per Gram (Rp)': string;
}

export interface GoldPricing {
  created_at: string;
  gold_buying_price: GoldBuyingPrice[];
  price_date: string;
  gold_selling_price: string;
}

export interface IGoldPortfolio {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  gold_weight: number;
  gold_buying_date: string;
  gold_buying_price: number;
  [key: string]: any;
};

export interface GumroadSubscription {
  id: string;
  email: string;
  seller_id: string;
  timestamp: string;
  daystamp: string;
  created_at: string;
  product_name: string;
  product_has_variants: boolean;
  price: number;
  gumroad_fee: number;
  is_bundle_purchase: boolean;
  is_bundle_product_purchase: boolean;
  subscription_duration: string;
  formatted_display_price: string;
  formatted_total_price: string;
  currency_symbol: string;
  amount_refundable_in_currency: string;
  product_id: string;
  product_permalink: string;
  refunded: boolean;
  partially_refunded: boolean;
  chargedback: boolean;
  purchase_email: string;
  full_name: string;
  state: string;
  country: string;
  country_iso2: string;
  paid: boolean;
  has_variants: boolean;
  variants: Record<string, string>;
  variants_and_quantity: string;
  has_custom_fields: boolean;
  custom_fields: Record<string, unknown>;
  order_id: number;
  is_product_physical: boolean;
  is_recurring_billing: boolean;
  can_contact: boolean;
  is_following: boolean;
  disputed: boolean;
  dispute_won: boolean;
  is_additional_contribution: boolean;
  discover_fee_charged: boolean;
  is_upgrade_purchase: boolean;
  is_more_like_this_recommended: boolean;
  is_gift_sender_purchase: boolean;
  is_gift_receiver_purchase: boolean;
  referrer: string;
  paypal_refund_expired: boolean;
  card: {
    visual: string;
    type: string;
    bin: string | null;
    expiry_month: string | null;
    expiry_year: string | null;
  };
  product_rating: number | null;
  reviews_count: number;
  average_rating: number;
  subscription_id: string;
  cancelled: boolean;
  dead: boolean;
  ended: boolean;
  free_trial_ended: string | null;
  free_trial_ends_on: string | null;
  recurring_charge: boolean;
  quantity: number;
}
