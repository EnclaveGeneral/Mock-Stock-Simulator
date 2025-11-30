import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar, SIDEBAR_WIDTH } from './Sidebar';
import { getCurrentUser } from 'aws-amplify/auth';
import { getUserProfile, getUserHoldings } from '../../services/dynamodbService';
import getStockQuote from '../../services/stockService';

// Helper function to delay between API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [cashBalance, setCashBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Price cache: { 'AAPL': { price: 150.25, fetchedAt: timestamp }, ... }
  const [priceCache, setPriceCache] = useState({});
  const [pricesLoading, setPricesLoading] = useState(true);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { userId } = await getCurrentUser();
        const userProfile = await getUserProfile(userId);
        const userHoldings = await getUserHoldings(userId);

        setProfile(userProfile);
        setCashBalance(userProfile.cashBalance);
        setHoldings(userHoldings);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch prices for all holdings (runs after holdings are loaded)
  useEffect(() => {
    const fetchAllPrices = async () => {
      if (loading || !holdings || holdings.length === 0) {
        setPricesLoading(false);
        return;
      }

      setPricesLoading(true);
      const newCache = { ...priceCache };

      for (const holding of holdings) {
        // Skip if we already have a recent price (less than 5 minutes old)
        const cached = newCache[holding.symbol];
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);

        if (cached && cached.fetchedAt > fiveMinutesAgo) {
          continue; // Use cached price
        }

        try {
          const quote = await getStockQuote(holding.symbol);
          newCache[holding.symbol] = {
            price: quote.c,
            high: quote.h,
            low: quote.l,
            open: quote.o,
            fetchedAt: Date.now()
          };
        } catch (error) {
          console.error(`Failed to fetch price for ${holding.symbol}:`, error);
          // Keep old cached price if fetch fails, or set null
          if (!newCache[holding.symbol]) {
            newCache[holding.symbol] = { price: null, fetchedAt: Date.now() };
          }
        }

        // Wait 1 second between calls to respect rate limit
        await delay(1000);
      }

      setPriceCache(newCache);
      setPricesLoading(false);
    };

    fetchAllPrices();
  }, [holdings, loading]);

  // Function to refresh a single stock price (used after trades)
  const refreshStockPrice = async (symbol) => {
    try {
      const quote = await getStockQuote(symbol);
      setPriceCache(prev => ({
        ...prev,
        [symbol]: {
          price: quote.c,
          high: quote.h,
          low: quote.l,
          open: quote.o,
          fetchedAt: Date.now()
        }
      }));
    } catch (error) {
      console.error(`Failed to refresh price for ${symbol}:`, error);
    }
  };

  // Function to refresh all prices (manual refresh button)
  const refreshAllPrices = async () => {
    setPricesLoading(true);
    const newCache = {};

    for (const holding of holdings) {
      try {
        const quote = await getStockQuote(holding.symbol);
        newCache[holding.symbol] = {
          price: quote.c,
          high: quote.h,
          low: quote.l,
          open: quote.o,
          fetchedAt: Date.now()
        };
      } catch (error) {
        console.error(`Failed to fetch price for ${holding.symbol}:`, error);
        newCache[holding.symbol] = { price: null, fetchedAt: Date.now() };
      }

      await delay(1000);
    }

    setPriceCache(newCache);
    setPricesLoading(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginLeft: `${SIDEBAR_WIDTH}px`,
          minHeight: '100vh',
          backgroundColor: '#1c1d1e',
          padding: 3,
        }}
      >
        <Outlet context={{
          profile,
          holdings,
          setHoldings,
          cashBalance,
          setCashBalance,
          priceCache,
          setPriceCache,
          pricesLoading,
          refreshStockPrice,
          refreshAllPrices,
          loading
        }} />
      </Box>
    </Box>
  );
}

export default Dashboard;