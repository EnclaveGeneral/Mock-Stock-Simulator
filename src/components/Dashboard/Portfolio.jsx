import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Chip,
  Button,
  CircularProgress,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useOutletContext } from 'react-router-dom';

function Portfolio() {
  // Get shared state from Dashboard parent (including cached prices!)
  const {
    holdings,
    cashBalance,
    loading,
    priceCache,
    pricesLoading,
    refreshAllPrices
  } = useOutletContext();

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercent = (percent) => {
    if (percent === null || percent === undefined) return '—';
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  // Build holdings with prices from cache
  const holdingsWithPrices = (holdings || []).map(holding => {
    const cached = priceCache[holding.symbol];
    const currentPrice = cached?.price || null;

    if (currentPrice === null) {
      return {
        ...holding,
        currentPrice: null,
        totalValue: null,
        costBasis: holding.quantity * holding.averageCost,
        gainLoss: null,
        gainLossPercent: null,
      };
    }

    const totalValue = holding.quantity * currentPrice;
    const costBasis = holding.quantity * holding.averageCost;
    const gainLoss = totalValue - costBasis;
    const gainLossPercent = ((currentPrice - holding.averageCost) / holding.averageCost) * 100;

    return {
      ...holding,
      currentPrice,
      totalValue,
      costBasis,
      gainLoss,
      gainLossPercent,
    };
  });

  // Calculate portfolio totals
  const calculateTotals = () => {
    if (!holdingsWithPrices || holdingsWithPrices.length === 0) {
      return { totalValue: 0, totalCostBasis: 0, totalGainLoss: 0 };
    }

    return holdingsWithPrices.reduce((acc, holding) => {
      return {
        totalValue: acc.totalValue + (holding.totalValue || 0),
        totalCostBasis: acc.totalCostBasis + (holding.costBasis || 0),
        totalGainLoss: acc.totalGainLoss + (holding.gainLoss || 0),
      };
    }, { totalValue: 0, totalCostBasis: 0, totalGainLoss: 0 });
  };

  const totals = calculateTotals();
  const totalGainLossPercent = totals.totalCostBasis > 0
    ? ((totals.totalGainLoss / totals.totalCostBasis) * 100)
    : 0;

  // Format the last updated time
  const getLastUpdatedTime = () => {
    if (!priceCache || Object.keys(priceCache).length === 0) return null;

    const timestamps = Object.values(priceCache).map(c => c.fetchedAt).filter(Boolean);
    if (timestamps.length === 0) return null;

    const mostRecent = Math.max(...timestamps);
    return new Date(mostRecent).toLocaleTimeString();
  };

  return (
    <Box>
      {/* Header with Refresh Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            color: '#ffffff',
            fontWeight: 700,
            fontFamily: 'Stack Sans, Arial, sans-serif',
          }}
        >
          Portfolio
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {getLastUpdatedTime() && (
            <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
              Prices updated at {getLastUpdatedTime()}
            </Typography>
          )}
          <Button
            variant="outlined"
            startIcon={pricesLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={refreshAllPrices}
            disabled={pricesLoading || holdings?.length === 0}
            sx={{
              borderColor: '#333',
              color: '#94a3b8',
              '&:hover': {
                borderColor: '#3b82f6',
                color: '#3b82f6',
              }
            }}
          >
            {pricesLoading ? 'Refreshing...' : 'Refresh Prices'}
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        {/* Portfolio Value Card */}
        <Card sx={{ backgroundColor: '#252627', borderRadius: 3, border: '1px solid #333', minWidth: 200 }}>
          <CardContent>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem', mb: 1 }}>
              Portfolio Value
            </Typography>
            <Typography variant="h5" sx={{ color: '#3b82f6', fontWeight: 700 }}>
              {pricesLoading ? <Skeleton width={120} /> : formatCurrency(totals.totalValue)}
            </Typography>
          </CardContent>
        </Card>

        {/* Cash Balance Card */}
        <Card sx={{ backgroundColor: '#252627', borderRadius: 3, border: '1px solid #333', minWidth: 200 }}>
          <CardContent>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem', mb: 1 }}>
              Cash Balance
            </Typography>
            <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 700 }}>
              {loading ? <Skeleton width={120} /> : formatCurrency(cashBalance)}
            </Typography>
          </CardContent>
        </Card>

        {/* Total Account Value Card */}
        <Card sx={{ backgroundColor: '#252627', borderRadius: 3, border: '1px solid #333', minWidth: 200 }}>
          <CardContent>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem', mb: 1 }}>
              Total Account Value
            </Typography>
            <Typography variant="h5" sx={{ color: '#10b981', fontWeight: 700 }}>
              {pricesLoading ? <Skeleton width={120} /> : formatCurrency(totals.totalValue + cashBalance)}
            </Typography>
          </CardContent>
        </Card>

        {/* Total Gain/Loss Card */}
        <Card sx={{ backgroundColor: '#252627', borderRadius: 3, border: '1px solid #333', minWidth: 200 }}>
          <CardContent>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem', mb: 1 }}>
              Total Gain/Loss
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {pricesLoading ? (
                <Skeleton width={120} />
              ) : (
                <>
                  {totals.totalGainLoss >= 0 ? (
                    <TrendingUpIcon sx={{ color: '#10b981' }} />
                  ) : (
                    <TrendingDownIcon sx={{ color: '#ef4444' }} />
                  )}
                  <Typography
                    variant="h5"
                    sx={{
                      color: totals.totalGainLoss >= 0 ? '#10b981' : '#ef4444',
                      fontWeight: 700
                    }}
                  >
                    {formatCurrency(totals.totalGainLoss)}
                  </Typography>
                  <Chip
                    label={formatPercent(totalGainLossPercent)}
                    size="small"
                    sx={{
                      backgroundColor: totals.totalGainLoss >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: totals.totalGainLoss >= 0 ? '#10b981' : '#ef4444',
                      fontWeight: 600
                    }}
                  />
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Holdings Table */}
      <Card sx={{ backgroundColor: '#252627', borderRadius: 3, border: '1px solid #333' }}>
        <CardContent>
          <Typography sx={{ color: '#ffffff', fontWeight: 600, mb: 2 }}>
            Holdings ({holdings?.length || 0})
          </Typography>

          {loading ? (
            // Loading skeleton
            <Box>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={60} sx={{ mb: 1 }} />
              ))}
            </Box>
          ) : holdings?.length === 0 ? (
            // Empty state
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography sx={{ color: '#94a3b8', mb: 1 }}>
                No holdings yet
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                Start trading to build your portfolio!
              </Typography>
            </Box>
          ) : (
            // Holdings table
            <TableContainer component={Paper} sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#94a3b8', borderBottom: '1px solid #333', fontWeight: 600 }}>
                      Symbol
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#94a3b8', borderBottom: '1px solid #333', fontWeight: 600 }}>
                      Shares
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#94a3b8', borderBottom: '1px solid #333', fontWeight: 600 }}>
                      Avg Cost
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#94a3b8', borderBottom: '1px solid #333', fontWeight: 600 }}>
                      Current Price
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#94a3b8', borderBottom: '1px solid #333', fontWeight: 600 }}>
                      Total Value
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#94a3b8', borderBottom: '1px solid #333', fontWeight: 600 }}>
                      Gain/Loss
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {holdingsWithPrices.map((holding) => (
                    <TableRow key={holding.symbol}>
                      <TableCell sx={{ color: '#ffffff', borderBottom: '1px solid #333', fontWeight: 700 }}>
                        {holding.symbol}
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#ffffff', borderBottom: '1px solid #333' }}>
                        {holding.quantity}
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#94a3b8', borderBottom: '1px solid #333' }}>
                        {formatCurrency(holding.averageCost)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#3b82f6', borderBottom: '1px solid #333', fontWeight: 600 }}>
                        {pricesLoading ? <Skeleton width={80} /> : formatCurrency(holding.currentPrice)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#ffffff', borderBottom: '1px solid #333', fontWeight: 600 }}>
                        {pricesLoading ? <Skeleton width={80} /> : formatCurrency(holding.totalValue)}
                      </TableCell>
                      <TableCell align="right" sx={{ borderBottom: '1px solid #333' }}>
                        {pricesLoading ? (
                          <Skeleton width={120} />
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                            <Typography
                              sx={{
                                color: holding.gainLoss >= 0 ? '#10b981' : '#ef4444',
                                fontWeight: 600
                              }}
                            >
                              {formatCurrency(holding.gainLoss)}
                            </Typography>
                            <Chip
                              label={formatPercent(holding.gainLossPercent)}
                              size="small"
                              sx={{
                                backgroundColor: holding.gainLoss >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                color: holding.gainLoss >= 0 ? '#10b981' : '#ef4444',
                                fontSize: '0.75rem',
                                height: 24
                              }}
                            />
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default Portfolio;