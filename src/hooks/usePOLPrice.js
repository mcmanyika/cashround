import { useState, useEffect, useCallback } from 'react';
import { priceService } from '../services/priceService';

export const usePOLPrice = () => {
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
    if (!priceData || !priceData.price) return '0.00';
    return priceService.calculateUSDValue(polAmount, priceData.price);
  }, [priceData]);

  const formatPrice = useCallback((decimals = 4) => {
    if (!priceData || !priceData.price) return '0.0000';
    return priceService.formatPrice(priceData.price, decimals);
  }, [priceData]);

  return { 
    priceData, 
    loading, 
    error, 
    refetch: fetchPrice,
    calculateUSDValue,
    formatPrice,
    price: priceData?.price || 0,
    change24h: priceData?.change24h || 0
  };
};
