import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Divider,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useOutletContext } from 'react-router-dom';
import { updateCashBalance, updateHolding, recordTransaction } from '../../services/dynamodbService';
import getStockQuote from '../../services/stockService';
import ErrorModal from '../Modals/errorModals';
import ConfirmModal from '../Modals/confirmModals';

function Trade() {
  // Get shared state from Dashboard parent
  const { profile, holdings, setHoldings, cashBalance, setCashBalance } = useOutletContext();

  // Search & Stock Data
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Trade Form
  const [tradeType, setTradeType] = useState('buy');
  const [quantity, setQuantity] = useState('');

  // Modals
  const [errorModal, setErrorModal] = useState({
    open: false,
    title: '',
    message: ''
  });
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: '',
    message: ''
  });

  const handleSearch = async () => {
    if (symbol === '') {
      setErrorModal({
        open: true,
        title: 'Missing input stock ticker',
        message: 'Please enter a stock symbol to search'
      });
      return;
    }

    setSearchLoading(true);

    try {
      const data = await getStockQuote(symbol);
      setStockData(data);
    } catch (error) {
      setErrorModal({
        open: true,
        title: 'Failure to fetch stock data',
        message: error.message || 'An error(s) has occurred during stock fetching process'
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleTrade = async () => {
    const qty = parseFloat(quantity) || 0;

    if (qty <= 0) {
      setErrorModal({
        open: true,
        title: "Invalid Quantity",
        message: "Please enter a valid quantity to proceed"
      });
      return;
    }

    const totalCost = qty * stockData.c;

    // Validate buy order
    if (tradeType === 'buy' && totalCost > cashBalance) {
      setErrorModal({
        open: true,
        title: 'Insufficient Funds',
        message: `You need ${formatCurrency(totalCost)} but only have ${formatCurrency(cashBalance)}`
      });
      return;
    }

    // Validate sell order
    if (tradeType === 'sell') {
      const existingHolding = holdings.find(item => item.symbol === symbol);

      if (!existingHolding) {
        setErrorModal({
          open: true,
          title: 'No Holdings',
          message: `You do not own any shares of ${symbol}`
        });
        return;
      }

      if (existingHolding.quantity < qty) {
        setErrorModal({
          open: true,
          title: 'Insufficient Holdings',
          message: `You only own ${existingHolding.quantity} shares of ${symbol}`
        });
        return;
      }
    }

    // Show confirmation modal
    setConfirmModal({
      open: true,
      title: `Confirm ${tradeType === 'buy' ? 'Purchase' : 'Sale'}`,
      message: `Are you sure you want to ${tradeType} ${qty} shares of ${symbol} for ${formatCurrency(totalCost)}?`
    });
  };

  const executeTrade = async () => {
    const stockPrice = stockData.c;
    const currentTime = new Date().toISOString();
    const qty = parseFloat(quantity);
    const oldHolding = holdings.find(item => item.symbol === symbol);

    if (tradeType === 'buy') {
      const totalCost = qty * stockPrice;
      const newCashBalance = cashBalance - totalCost;

      // Calculate new quantity and average cost
      let newQuantity;
      let newAverageCost;

      if (!oldHolding) {
        newQuantity = qty;
        newAverageCost = stockPrice;
      } else {
        newQuantity = oldHolding.quantity + qty;
        const oldTotalValue = oldHolding.quantity * oldHolding.averageCost;
        const newTotalValue = oldTotalValue + totalCost;
        newAverageCost = newTotalValue / newQuantity;
      }

      // Update DynamoDB
      try {
        await updateCashBalance(profile.userId, newCashBalance);
        await updateHolding(profile.userId, symbol, newQuantity, newAverageCost);
        await recordTransaction(profile.userId, symbol, 'BUY', qty, stockPrice, totalCost);
      } catch (error) {
        setErrorModal({
          open: true,
          title: "Failed to execute transaction",
          message: error.message || "An error occurred while updating server"
        });
        return;
      }

      // Update local state
      setCashBalance(newCashBalance);
      if (!oldHolding) {
        // Add new holding
        setHoldings([...holdings, {
          userId: profile.userId,
          symbol,
          quantity: qty,
          averageCost: stockPrice,
          updatedAt: currentTime,
        }]);
      } else {
        // Update existing holding
        setHoldings(holdings.map(h =>
          h.symbol === symbol
            ? { ...h, quantity: newQuantity, averageCost: newAverageCost, updatedAt: currentTime }
            : h
        ));
      }

    } else {
      // SELL logic
      const totalGains = stockPrice * qty;
      const newCashBalance = cashBalance + totalGains;
      const newHoldingQty = oldHolding.quantity - qty;

      // Update DynamoDB
      try {
        await updateCashBalance(profile.userId, newCashBalance);
        await updateHolding(profile.userId, symbol, newHoldingQty, oldHolding.averageCost);
        await recordTransaction(profile.userId, symbol, 'SELL', qty, stockPrice, totalGains);
      } catch (error) {
        setErrorModal({
          open: true,
          title: 'Failed to execute transaction',
          message: error.message || "An error occurred while updating server"
        });
        return;
      }

      // Update local state
      setCashBalance(newCashBalance);
      if (newHoldingQty <= 0) {
        // Remove holding entirely
        setHoldings(holdings.filter(h => h.symbol !== symbol));
      } else {
        // Update holding quantity
        setHoldings(holdings.map(h =>
          h.symbol === symbol
            ? { ...h, quantity: newHoldingQty, updatedAt: currentTime }
            : h
        ));
      }
    }

    // Reset form and close modal
    setConfirmModal({ open: false, title: '', message: '' });
    setQuantity('');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{
          color: '#ffffff',
          fontWeight: 700,
          fontFamily: 'Stack Sans, Arial, sans-serif',
          mb: 3
        }}
      >
        Trade Stocks
      </Typography>

      <Grid container spacing={3}>
        {/* Search Section */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ backgroundColor: '#252627', borderRadius: 3, border: '1px solid #333' }}>
            <CardContent>
              <Typography sx={{ color: '#ffffff', fontWeight: 600, mb: 2 }}>
                Search Stock
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Enter symbol (e.g., AAPL)"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#1c1d1e',
                      color: '#ffffff',
                      '& fieldset': { borderColor: '#333' },
                      '&:hover fieldset': { borderColor: '#3b82f6' },
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={searchLoading}
                  sx={{
                    backgroundColor: '#3b82f6',
                    '&:hover': { backgroundColor: '#2563eb' }
                  }}
                >
                  {searchLoading ? <CircularProgress size={24} /> : <SearchIcon />}
                </Button>
              </Box>

              {/* Stock Info Display */}
              {stockData && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ borderColor: '#333', mb: 2 }} />
                  <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 700 }}>
                    {symbol}
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#3b82f6', fontWeight: 700, mt: 1 }}>
                    {formatCurrency(stockData.c)}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 3 }}>
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                      High: {formatCurrency(stockData.h)}
                    </Typography>
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                      Low: {formatCurrency(stockData.l)}
                    </Typography>
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                      Open: {formatCurrency(stockData.o)}
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Trade Form Section */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ backgroundColor: '#252627', borderRadius: 3, border: '1px solid #333' }}>
            <CardContent>
              <Typography sx={{ color: '#ffffff', fontWeight: 600, mb: 2 }}>
                Place Order
              </Typography>

              {/* Buy/Sell Toggle */}
              <ToggleButtonGroup
                value={tradeType}
                exclusive
                onChange={(e, newType) => newType && setTradeType(newType)}
                fullWidth
                sx={{ mb: 3 }}
              >
                <ToggleButton
                  value="buy"
                  sx={{
                    color: tradeType === 'buy' ? '#10b981' : '#94a3b8',
                    borderColor: '#333',
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(16, 185, 129, 0.2)',
                      color: '#10b981',
                    }
                  }}
                >
                  Buy
                </ToggleButton>
                <ToggleButton
                  value="sell"
                  sx={{
                    color: tradeType === 'sell' ? '#ef4444' : '#94a3b8',
                    borderColor: '#333',
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                    }
                  }}
                >
                  Sell
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Quantity Input */}
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#1c1d1e',
                    color: '#ffffff',
                    '& fieldset': { borderColor: '#333' },
                  },
                  '& .MuiInputLabel-root': { color: '#94a3b8' }
                }}
              />

              {/* Order Summary */}
              {stockData && parseFloat(quantity) > 0 && (
                <Box sx={{ mb: 2, p: 2, backgroundColor: '#1c1d1e', borderRadius: 2 }}>
                  <Typography sx={{ color: '#94a3b8', mb: 1 }}>
                    Order Summary
                  </Typography>
                  <Typography sx={{ color: '#ffffff' }}>
                    {tradeType === 'buy' ? 'Buy' : 'Sell'} {quantity} shares of {symbol}
                  </Typography>
                  <Typography sx={{ color: '#3b82f6', fontWeight: 700, mt: 1 }}>
                    Total: {formatCurrency(stockData.c * parseFloat(quantity))}
                  </Typography>
                </Box>
              )}

              {/* Submit Button */}
              <Button
                fullWidth
                variant="contained"
                onClick={handleTrade}
                disabled={!stockData || !quantity || parseFloat(quantity) <= 0}
                sx={{
                  py: 1.5,
                  backgroundColor: tradeType === 'buy' ? '#10b981' : '#ef4444',
                  '&:hover': {
                    backgroundColor: tradeType === 'buy' ? '#059669' : '#dc2626'
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#333'
                  }
                }}
              >
                {tradeType === 'buy' ? 'Buy' : 'Sell'} Stock
              </Button>

              {/* Cash Balance Display */}
              <Typography sx={{ color: '#94a3b8', mt: 2, textAlign: 'center' }}>
                Available Cash: {formatCurrency(cashBalance || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modals */}
      <ErrorModal
        open={errorModal.open}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() => setErrorModal({ open: false, title: '', message: '' })}
      />

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={executeTrade}
        onCancel={() => setConfirmModal({ open: false, title: '', message: '' })}
      />
    </Box>
  );
}

export default Trade;