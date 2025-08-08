import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { priceService } from '../services/priceService';

// Create the price context
const PriceContext = createContext();

// Price Provider Component
export const PriceProvider = ({ children }) => {
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrice = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await priceService.getPOLPrice();
      setPriceData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching POL price:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrice();
    
    // Update price every 30 seconds
    const interval = setInterval(fetchPrice, 30000);
    
    return () => clearInterval(interval);
  }, [fetchPrice]);

  // Helper functions
  const calculateUSDValue = useCallback((polAmount) => {
    if (!priceData || !priceData.price || !polAmount) return '0.00';
    return priceService.calculateUSDValue(polAmount, priceData.price);
  }, [priceData]);

  const formatPrice = useCallback((decimals = 4) => {
    if (!priceData || !priceData.price) return '0.0000';
    return priceService.formatPrice(priceData.price, decimals);
  }, [priceData]);

  const formatPolAmount = useCallback((polAmount, decimals = 2) => {
    if (!polAmount) return '0.00';
    return parseFloat(polAmount).toFixed(decimals);
  }, []);

  const formatLargeNumber = useCallback((num) => {
    if (!num) return '0';
    return priceService.formatLargeNumber(num);
  }, []);

  // Context value
  const value = {
    // State
    priceData,
    loading,
    error,
    
    // Price values
    price: priceData?.price || 0,
    change24h: priceData?.change24h || 0,
    marketCap: priceData?.marketCap || 0,
    volume24h: priceData?.volume24h || 0,
    source: priceData?.source || 'unknown',
    
    // Helper functions
    calculateUSDValue,
    formatPrice,
    formatPolAmount,
    formatLargeNumber,
    
    // Actions
    refetch: fetchPrice,
    
    // Quick check for data availability
    hasPrice: !!(priceData && priceData.price)
  };

  return (
    <PriceContext.Provider value={value}>
      {children}
    </PriceContext.Provider>
  );
};

// Custom hook to use price context
export const usePriceContext = () => {
  const context = useContext(PriceContext);
  
  if (context === undefined) {
    throw new Error('usePriceContext must be used within a PriceProvider');
  }
  
  return context;
};

// HOC for components that need price data
export const withPrice = (Component) => {
  return (props) => {
    const priceContext = usePriceContext();
    return <Component {...props} price={priceContext} />;
  };
};

export default PriceContext;
