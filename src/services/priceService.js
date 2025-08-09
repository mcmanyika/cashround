// Price service for fetching live POL exchange rates
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
const COINMARKETCAP_API_BASE = 'https://pro-api.coinmarketcap.com/v1';

class PriceService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 60000; // 1 minute cache
  }

  // Get cached price if available and not expired
  getCachedPrice(symbol) {
    const cached = this.cache.get(symbol);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  // Set price in cache
  setCachedPrice(symbol, data) {
    this.cache.set(symbol, {
      data,
      timestamp: Date.now()
    });
  }

  // Fetch POL price from CoinGecko (free API)
  async fetchPOLPriceFromCoinGecko() {
    try {
      const response = await fetch(
        `${COINGECKO_API_BASE}/simple/price?ids=polygon-ecosystem-token&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data['polygon-ecosystem-token']) {
        return {
          price: data['polygon-ecosystem-token'].usd,
          change24h: data['polygon-ecosystem-token'].usd_24h_change,
          marketCap: data['polygon-ecosystem-token'].usd_market_cap,
          volume24h: data['polygon-ecosystem-token'].usd_24h_vol,
          source: 'coingecko',
          timestamp: Date.now()
        };
      }
      
      throw new Error('POL price data not found');
    } catch (error) {
      console.error('Error fetching POL price from CoinGecko:', error);
      throw error;
    }
  }

  // Fetch POL price from CoinMarketCap (requires API key)
  async fetchPOLPriceFromCoinMarketCap() {
    const apiKey = process.env.NEXT_PUBLIC_COINMARKETCAP_API_KEY;
    
    if (!apiKey) {
      throw new Error('CoinMarketCap API key not configured');
    }

    try {
      const response = await fetch(
        `${COINMARKETCAP_API_BASE}/cryptocurrency/quotes/latest?symbol=POL`,
        {
          headers: {
            'X-CMC_PRO_API_KEY': apiKey,
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.data && data.data.POL && data.data.POL[0]) {
        const polData = data.data.POL[0];
        const quote = polData.quote.USD;
        
        return {
          price: quote.price,
          change24h: quote.percent_change_24h,
          marketCap: quote.market_cap,
          volume24h: quote.volume_24h,
          source: 'coinmarketcap',
          timestamp: Date.now()
        };
      }
      
      throw new Error('POL price data not found');
    } catch (error) {
      console.error('Error fetching POL price from CoinMarketCap:', error);
      throw error;
    }
  }

  // Fallback to a simple price API
  async fetchPOLPriceFromFallback() {
    try {
      const response = await fetch(
        'https://api.coinlore.net/api/ticker/?id=28321' // POL ID on CoinLore
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data[0]) {
        return {
          price: parseFloat(data[0].price_usd),
          change24h: parseFloat(data[0].percent_change_24h),
          marketCap: parseFloat(data[0].market_cap_usd),
          volume24h: parseFloat(data[0].volume24),
          source: 'coinlore',
          timestamp: Date.now()
        };
      }
      
      throw new Error('POL price data not found');
    } catch (error) {
      console.error('Error fetching POL price from fallback:', error);
      throw error;
    }
  }

  // Main method to get POL price with fallbacks
  async getPOLPrice() {
    const symbol = 'POL';
    
    // Check cache first
    const cached = this.getCachedPrice(symbol);
    if (cached) {
      return cached;
    }

    // Try multiple APIs in order of preference
    const apis = [
      () => this.fetchPOLPriceFromCoinGecko(),
      () => this.fetchPOLPriceFromFallback(),
      () => this.fetchPOLPriceFromCoinMarketCap()
    ];

    for (const apiCall of apis) {
      try {
        const priceData = await apiCall();
        this.setCachedPrice(symbol, priceData);
        return priceData;
      } catch (error) {
        console.warn('API call failed, trying next...', error.message);
        continue;
      }
    }

    // If all APIs fail, return cached data even if expired, or default
    const expiredCache = this.cache.get(symbol);
    if (expiredCache) {
      console.warn('All APIs failed, using expired cache');
      return expiredCache.data;
    }

    // Ultimate fallback - return static price (should be updated regularly)
    console.error('All price APIs failed, using static fallback');
    return {
      price: 0.24, // Static fallback price
      change24h: 0,
      marketCap: 0,
      volume24h: 0,
      source: 'static_fallback',
      timestamp: Date.now()
    };
  }

  // Calculate USD value for POL amount
  calculateUSDValue(polAmount, polPrice) {
    return (parseFloat(polAmount) * polPrice).toFixed(2);
  }

  // Format price for display
  formatPrice(price, decimals = 4) {
    return parseFloat(price).toFixed(decimals);
  }

  // Format large numbers (market cap, volume)
  formatLargeNumber(num) {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(2) + 'B';
    }
    if (num >= 1e6) {
      return (num / 1e6).toFixed(2) + 'M';
    }
    if (num >= 1e3) {
      return (num / 1e3).toFixed(2) + 'K';
    }
    return num.toFixed(2);
  }
}

// Create and export singleton instance
export const priceService = new PriceService();

// Note: React hook is in separate file src/hooks/usePOLPrice.js

export default priceService;
