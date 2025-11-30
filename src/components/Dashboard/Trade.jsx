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
  avatarClasses,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useOutletContext } from 'react-router-dom';
import { updateCashBalance, updateHolding, recordTransaction } from '../../services/dynamodbService';
import getStockQuote from '../../services/stockService';
import ErrorModal from '../Modals/errorModals';
import ConfirmModal from '../Modals/confirmModals';

function Trade() {
  // List inherited data and properties
  const { profile, holdings, setHoldings, cashBalance, setCashBalance } = useOutletContext();

  // Search & Stock Data
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Trade Form
  const [tradeType, setTradeType] = useState('buy');
  const [quantity, setQuantity] = useState(null);

  // User Data directly comes from UseOutletContext.

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

  // TODO: fetch user's cash balance on component mount

  const handleSearch = async () => {
    if (symbol === '') {
      setErrorModal({
        open: true,
        title: 'Missing input stock ticker',
        message: 'Please enter a stock symbol to search'
      })
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
        message: error.message || 'An error(s) has occured during stock fetching process'
      })
    } finally {
      setSearchLoading(false);
    }
  };

  const handleTrade = async () => {
    // TODO: Validate and show confirmation modal
    // 1. Check quantity is valid
    // 2. Check user has enough cash (for buy) or shares (for sell)
    // 3. Show confirmation modal with trade details
    if (!quantity || quantity <= 0) {
      setErrorModal({
        open: true,
        title: "Invalid Quantity",
        message: "Please enter a valid quantity to proceed"
      })
      return;
    }

    const totalCost = quantity * stockData.c;

    // First, we need to see if we want to buy or sell
    if (tradeType === 'buy' && totalCost > cashBalance ) {
      setErrorModal({
        open: true,
        title: 'Insufficient Funds',
        message: `You need ${formatCurrency(totalCost)} but only have ${formatCurrency(cashBalance)}`
      })
      return;
    }

    // Now we need to handle selling errors
    if (tradeType === 'sell') {


      const result = holdings.find(item => item.symbol === symbol);

      if (!result) {
        setErrorModal({
          open: true,
          title: 'No Holdings',
          message: `You do not own any share of ${stockData.symbol} `
        })
        return;
      }

      if (result.quantity < quantity) {
        setErrorModal({
          open: true,
          title: 'Insufficient Holdings',
          message: `You only own ${result.quantity} shares of ${stockData.symbol}`
        });
        return;
      }
    }

    setConfirmModal({
      open: true,
      title: `Confirm ${tradeType === 'buy' ? 'Purchase' : 'Sale'}`,
      message: `Are you sure you want to ${tradeType} ${quantity} shares of ${stockData.symbol} for ${formatCurrency(totalCost)}?`
    });

  };

  const executeTrade = async () => {
    // TODO: Execute the actual trade
    // 1. Update cash balance in DynamoDB
    // 2. Update/create holding in DynamoDB
    // 3. Record transaction in DynamoDB
    // 4. Update local state
    // 5. Show success or error

    // We have buy and sell!
    const stockPrice = stockData.c;
    const currentTime = new Date().toISOString();
    const oldHolding = holdings.find(item => item.symbol === symbol);

    // If we are buying
    if (tradeType === 'buy') {
      const totalCost = quantity * stockPrice;
      const newCashBalance = cashBalance - totalCost;

      // Calculate the new average price
      // Check if we had already bought
      let newQuantity;
      let newAverageCost;

      if (!oldHolding) {
        newQuantity = quantity;
        newAverageCost = stockPrice;
      } else {
        newQuantity = oldHolding.quantity + quantity;
        const newTotalCost = oldHolding.quantity * oldHolding.averageCost + totalCost;
        newAverageCost = newTotalCost / (oldHolding.quantity + quantity);
      }

      // Now Update DynamoDB
      try {
        await updateCashBalance(profile.userId, cashBalance);
        await updateHolding(profile.userId, symbol, newQuantity, newAverageCost);
        await recordTransaction(profile.userId, symbol, 'Buy', stockPrice, quantity);
      } catch (error) {
        setErrorModal({
          open: true,
          title: "Failed to execute transaction",
          message: error.message || "An error(s) has occured while attempting to update server"
        })
        return;
      }

      // Now update the local state
      setCashBalance(newCashBalance);
      if (!oldHolding) {
        // We do not own any stock of this type! Add a new entry based on current order
        let newEntry = {
          userId: profile.userId,
          symbol,
          quantity: quantity,
          averageCost: stockPrice,
          updatedAt: currentTime,
        };
        setHoldings([...holdings, newEntry]);
      } else {
        // We have an existing attribute, calculate the old price, then calculate the new average price as well as quantity
        setHoldings(holdings.map(h =>
          h.symbol === symbol
            ? {...h, quantity: newQuantity, averageCost: newAverageCost, updatedAt: currentTime}
            : h
        ));
      }


    } else {
      // If we are selling
      // We know we have enough to sell, so dont worry about that!
      const totalGains = stockPrice * quantity;

      // If we sell everything, we need to delete the listing
      const newHoldings = oldHolding.quantity - quantity;

      // Now we call dynamoDB and update our server end information
      try {
        await updateCashBalance(cashBalance);
        await updateHolding(profile.userId, symbol, newHoldings, oldHolding.averageCost);
        await recordTransaction(profile.userId, symbol, 'Sell', quantity, stockPrice, totalGains);
      } catch (error) {
        setErrorModal({
          open: true,
          title: 'Failed to execute transaction',
          message: error.message || "An error(s) has occured while attempting to update server"
        });
        return;
      }

      // After cloud end update, update local states
      setCashBalance(cashBalance + totalGains); // Mark the gains
      if (newHoldings === 0) {
        setHoldings(holdings.filter(h => h.symbol !== symbol));
      } else {
        // Update holdings
        setHoldings(holdings.map(h =>
          h.symbol === symbol
          ? {...h, quantity: newHoldings, updatedAt: currentTime}
          : h
        ));
      }
    }

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
                    {stockData.symbol}
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#3b82f6', fontWeight: 700, mt: 1 }}>
                    {formatCurrency(stockData.c)} {/* c = current price from Finnhub */}
                  </Typography>
                  {/* TODO: Add more stock details like daily change */}
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
              {stockData && quantity > 0 && (
                <Box sx={{ mb: 2, p: 2, backgroundColor: '#1c1d1e', borderRadius: 2 }}>
                  <Typography sx={{ color: '#94a3b8', mb: 1 }}>
                    Order Summary
                  </Typography>
                  <Typography sx={{ color: '#ffffff' }}>
                    {tradeType === 'buy' ? 'Buy' : 'Sell'} {quantity} shares of {stockData.symbol}
                  </Typography>
                  <Typography sx={{ color: '#3b82f6', fontWeight: 700, mt: 1 }}>
                    Total: {formatCurrency(stockData.c * quantity)}
                  </Typography>
                </Box>
              )}

              {/* Submit Button */}
              <Button
                fullWidth
                variant="contained"
                onClick={handleTrade}
                disabled={!stockData || !quantity}
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
