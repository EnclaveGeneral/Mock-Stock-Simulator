import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Skeleton,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useOutletContext } from 'react-router-dom';

function InfoRow({ icon: Icon, label, value, valueColor = '#ffffff', loading }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 2,
        }}
      >
        <Icon sx={{ color: '#3b82f6' }} />
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>{label}</Typography>

        {loading ? (
          <Skeleton width={150} />
        ) : (
          <Typography sx={{ color: valueColor, fontWeight: 600 }}>{value}</Typography>
        )}
      </Box>
    </Box>
  );
}

function Account() {
  // Get shared state from Dashboard parent
  const { profile, cashBalance, loading } = useOutletContext();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
        Account
      </Typography>

      {/* Profile Card */}
      <Card sx={{ backgroundColor: '#252627', borderRadius: 3, border: '1px solid #333', maxWidth: 500 }}>
        <CardContent>
          <Typography sx={{ color: '#ffffff', fontWeight: 600, mb: 2 }}>
            Profile Information
          </Typography>

          <Divider sx={{ borderColor: '#333', mb: 1 }} />

          <InfoRow
            icon={PersonIcon}
            label="Display Name"
            value={profile?.displayUsername || '—'}
          />

          <Divider sx={{ borderColor: '#333' }} />

          <InfoRow
            icon={AccountBalanceWalletIcon}
            label="Starting Balance"
            value={formatCurrency(profile?.cashBalance || 0)}
            valueColor="#3b82f6"
          />

          <Divider sx={{ borderColor: '#333' }} />

          <InfoRow
            icon={AccountBalanceWalletIcon}
            label="Current Cash Balance"
            value={formatCurrency(cashBalance || 0)}
            valueColor="#10b981"
          />

          <Divider sx={{ borderColor: '#333' }} />

          <InfoRow
            icon={CalendarTodayIcon}
            label="Account Created"
            value={formatDate(profile?.createdAt)}
          />

          <Divider sx={{ borderColor: '#333' }} />

          <InfoRow
            icon={CalendarTodayIcon}
            label="Last Updated"
            value={formatDate(profile?.updatedAt)}
          />
        </CardContent>
      </Card>

      {/* Account ID Card (for reference) */}
      <Card sx={{ backgroundColor: '#252627', borderRadius: 3, border: '1px solid #333', maxWidth: 500, mt: 3 }}>
        <CardContent>
          <Typography sx={{ color: '#ffffff', fontWeight: 600, mb: 2 }}>
            Account Details
          </Typography>

          <Divider sx={{ borderColor: '#333', mb: 2 }} />

          <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem', mb: 0.5 }}>
            User ID
          </Typography>
          {loading ? (
            <Skeleton width={250} />
          ) : (
            <Typography
              sx={{
                color: '#64748b',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}
            >
              {profile?.userId || '—'}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default Account;