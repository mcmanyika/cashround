import { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';

export function useUserData() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const activeAccount = useActiveAccount();

  useEffect(() => {
    if (!activeAccount?.address) {
      setUserData(null);
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users?address=${activeAccount.address}`);
        
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else if (response.status === 404) {
          // User doesn't exist, create them
          const createResponse = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              address: activeAccount.address,
            }),
          });
          
          if (createResponse.ok) {
            const newUser = await createResponse.json();
            setUserData(newUser);
          } else {
            setError('Failed to create user');
          }
        } else {
          setError('Failed to fetch user data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [activeAccount?.address]);

  return { userData, loading, error };
}

export function usePoolsData() {
  const [poolsData, setPoolsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPoolsData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/pools');
        
        if (response.ok) {
          const data = await response.json();
          setPoolsData(data);
        } else {
          setError('Failed to fetch pools data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPoolsData();
  }, []);

  return { poolsData, loading, error };
}

export function useUserAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const activeAccount = useActiveAccount();

  useEffect(() => {
    if (!activeAccount?.address) {
      setAnalytics(null);
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/analytics?type=user&address=${activeAccount.address}`);
        
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        } else {
          setError('Failed to fetch analytics');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [activeAccount?.address]);

  return { analytics, loading, error };
}

export function usePoolAnalytics(poolAddress) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!poolAddress) {
      setAnalytics(null);
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/analytics?type=pool&address=${poolAddress}`);
        
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        } else {
          setError('Failed to fetch pool analytics');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [poolAddress]);

  return { analytics, loading, error };
}

export function usePlatformAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/analytics?type=overview');
        
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        } else {
          setError('Failed to fetch platform analytics');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return { analytics, loading, error };
}

// Helper function to track user activity
export async function trackActivity(activityType, details = null) {
  try {
    const response = await fetch('/api/activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activityType,
        details,
      }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error tracking activity:', error);
    return false;
  }
}
