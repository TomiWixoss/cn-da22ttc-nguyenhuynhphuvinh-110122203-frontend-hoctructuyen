// Currency-related TypeScript types and interfaces

/**
 * Individual currency balance data
 */
export interface CurrencyData {
  currency_id: number;
  currency_code: string;
  currency_name: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  daily_earned_today: number;
  is_premium: boolean;
  icon_path: string;
}

/**
 * Complete currency balance response from API
 */
export interface CurrencyBalance {
  user_id: number;
  currencies: {
    SYNC: CurrencyData;
    // GAME_SYSTEM: Loại bỏ Kristal
  };
  total_wealth_in_syncoin: number;
}

/**
 * User currencies with additional metadata
 */
export interface UserCurrencies {
  user_id: number;
  currencies: {
    SYNC: CurrencyData;
  };
  total_wealth_in_syncoin: number;
  last_updated: string;
  daily_limit_sync: number;
  daily_limit_kris: number;
}

/**
 * Currency display configuration
 */
export interface CurrencyDisplayConfig {
  showTooltip: boolean;
  showIcons: boolean;
  compact: boolean;
}

/**
 * Currency update event data
 */
export interface CurrencyUpdateEvent {
  type: "SYNC";
  amount: number;
  operation: "earned" | "spent";
  reason: string;
  timestamp: string;
}

/**
 * Currency cache data
 */
export interface CurrencyCacheData {
  data: CurrencyBalance;
  timestamp: number;
  expiresAt: number;
}

/**
 * Currency API response wrapper
 */
export interface CurrencyApiResponse {
  success: boolean;
  message: string;
  data: CurrencyBalance;
}

/**
 * Currency service error types
 */
export interface CurrencyError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Currency formatting options
 */
export interface CurrencyFormatOptions {
  showDecimals: boolean;
  useThousandsSeparator: boolean;
  prefix?: string;
  suffix?: string;
}
