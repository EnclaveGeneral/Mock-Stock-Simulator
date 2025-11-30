import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Skeleton,
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import ErrorModal from '../Modals/errorModals';

function DashboardHome() {
  // Get shared state from Dashboard parent (including cached prices!)
  const { profile, holdings, cashBalance, priceCache, pricesLoading, loading } = useOutletContext();

  // Local error modal state
  const [errorModal, setErrorModal] = useState({
    open: false,
    title: '',
    message: ''
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate portfolio value from holdings using cached prices
  const calculatePortfolioValue = () => {
    if (!holdings || holdings.length === 0) return 0;

    return holdings.reduce((total, holding) => {
      // Use cached live price if available, otherwise fall back to averageCost
      const cached = priceCache?.[holding.symbol];
      const price = cached?.price || holding.averageCost;
      return total + (holding.quantity * price);
    }, 0);
  };

  const portfolioValue = calculatePortfolioValue();
  const totalAccountValue = cashBalance + portfolioValue;

  // Show loading state while either user data or prices are loading
  const isLoading = loading || pricesLoading;

  return (
    <Box>
      {/* Welcome Header */}
      <Typography
        variant="h4"
        sx={{
          color: '#ffffff',
          fontWeight: 700,
          fontFamily: 'Stack Sans, Arial, sans-serif',
          mb: 3
        }}
      >
        {loading ? (
          <Skeleton width={300} />
        ) : (
          `Welcome back, ${profile?.displayUsername || 'Trader'}!`
        )}
      </Typography>

      {/* Stats Cards Grid */}
      <Grid container spacing={3}>
        {/* Cash Balance Card */}
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Card
            sx={{
              backgroundColor: '#252627',
              borderRadius: 3,
              border: '1px solid #333'
            }}
          >
            <CardContent>
              <Typography
                sx={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  mb: 1
                }}
              >
                Cash Balance
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  color: '#3b82f6',
                  fontWeight: 700
                }}
              >
                {loading ? (
                  <Skeleton width={150} />
                ) : (
                  formatCurrency(cashBalance || 0)
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Portfolio Value Card */}
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Card
            sx={{
              backgroundColor: '#252627',
              borderRadius: 3,
              border: '1px solid #333',
            }}
          >
            <CardContent>
              <Typography
                sx={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  mb: 1
                }}
              >
                Portfolio Value
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  color: '#10b981',
                  fontWeight: 700
                }}
              >
                {isLoading ? (
                  <Skeleton width={150} />
                ) : (
                  formatCurrency(portfolioValue)
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Account Value Card */}
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Card
            sx={{
              backgroundColor: '#252627',
              borderRadius: 3,
              border: '1px solid #333'
            }}
          >
            <CardContent>
              <Typography
                sx={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  mb: 1
                }}
              >
                Total Account Value
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  color: '#ffffff',
                  fontWeight: 700
                }}
              >
                {isLoading ? (
                  <Skeleton width={150} />
                ) : (
                  formatCurrency(totalAccountValue)
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Number of Holdings Card */}
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Card
            sx={{
              backgroundColor: '#252627',
              borderRadius: 3,
              border: '1px solid #333'
            }}
          >
            <CardContent>
              <Typography
                sx={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  mb: 1
                }}
              >
                Holdings
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  color: '#f59e0b',
                  fontWeight: 700
                }}
              >
                {loading ? (
                  <Skeleton width={150} />
                ) : (
                  `${holdings?.length || 0} stocks`
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Error Modal */}
      <ErrorModal
        open={errorModal.open}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() => setErrorModal({ open: false, title: '', message: '' })}
      />
    </Box>
  );
}

export default DashboardHome;