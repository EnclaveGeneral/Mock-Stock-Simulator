// Dashboard.jsx
import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar, SIDEBAR_WIDTH } from './Sidebar';
import { getCurrentUser } from 'aws-amplify/auth';
import { getUserProfile, getUserHoldings } from '../../services/dynamodbService';

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [cashBalance, setCashBalance] = useState(0);
  const [loading, setLoading] = useState(true);

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
          loading
        }} />
      </Box>
    </Box>
  );
}

export default Dashboard;