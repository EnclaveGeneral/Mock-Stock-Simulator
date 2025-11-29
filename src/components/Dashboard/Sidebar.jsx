import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';

// Icons - pick the ones you want from MUI icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import ErrorModal from '../Modals/errorModals';
import { useState } from 'react';

const SIDEBAR_WIDTH = 280;

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
  { label: 'Trade', path: '/dashboard/trade', icon: TrendingUpIcon },
  { label: 'Portfolio', path: '/dashboard/portfolio', icon: AccountBalanceWalletIcon },
  { label: 'Account', path: '/dashboard/account', icon: PersonIcon },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorModal, setErrorModal] = useState({
    open: false,
    title: '',
    message: ''
  });

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (errors) {
      setErrorModal({
        open: true,
        title: 'Failed To Logout',
        message: errors.message || 'An error(s) has occured during logout'
      })
    }
  }

  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: '100vh',
        backgroundColor: '#252627',
        borderRight: '1px solid #333',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
      }}
    >
      {/* App Title */}
      <Box sx={{ p: 3 }}>
        <Typography
          variant="h5"
          sx={{
            color: '#3b82f6',
            fontWeight: 700,
            fontFamily: 'Stack Sans, Arial, sans-serif',
          }}
        >
          Mock Trader Pro
        </Typography>
      </Box>

      <Divider sx={{ borderColor: '#333' }} />

      {/* Navigation Items */}
      <List sx={{ flex: 1, pt: 2 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                  },
                }}
              >
                <ListItemIcon>
                  <Icon sx={{ color: isActive ? '#3b82f6' : '#94a3b8' }} />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiTypography-root': {
                      color: isActive ? '#3b82f6' : '#94a3b8',
                      fontWeight: isActive ? 600 : 400,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Logout Button at Bottom */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ borderColor: '#333', mb: 2 }} />
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            '&:hover': {
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
            },
          }}
        >
          <ListItemIcon>
            <LogoutIcon sx={{ color: '#ef4444' }} />
          </ListItemIcon>
          <ListItemText
            primary="Log Out"
            sx={{
              '& .MuiTypography-root': {
                color: '#ef4444',
                fontWeight: 500,
              },
            }}
          />
        </ListItemButton>
      </Box>

      <ErrorModal
        open={errorModal.open}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() => setErrorModal({open: false, title: '', message: ''})}
      />
    </Box>
  );
}

export { Sidebar, SIDEBAR_WIDTH };
