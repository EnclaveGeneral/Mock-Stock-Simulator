import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Skeleton,
} from '@mui/material';
import { getCurrentUser } from 'aws-amplify/auth';
import { getUserProfile } from '../../services/dynamodbService';
import ErrorModal from '../Modals/errorModals';

function DashboardHome() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(null);
  const [errorModal, setErrorModal] = useState({
    open: false,
    title: '',
    message: ''
  });

  useEffect(() => {
    // We need to populate the profile section

    // First we need to grab userId from cognito, then get the userprofile from dynamoDB
    setLoading(true);

    const fetchUserData = async() => {

      try {
        const { userId } = await getCurrentUser();
        const userProfile = await getUserProfile(userId);

        setProfile(userProfile);

      } catch (error) {
        setErrorModal({
          open: true,
          title: "Failed To Fetch User Login Information",
          message: error.message || "An error(s) has occured while attempting to fetch user information"
        })
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();

  }, []);


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

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
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
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
                  formatCurrency(profile?.cashBalance || 0)
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* TODO: Add more cards */}

        {/* - Portfolio Value card */}
        <Grid size="auto">
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
                { loading ? (
                  <Skeleton width={150} />
                ) : (
                  formatCurrency(0)
                ) }
              </Typography>
            </CardContent>

          </Card>

        </Grid>

        {/* Total Account Value Card */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
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
                {loading ? (
                  <Skeleton width={150} />
                ) : (
                  formatCurrency(profile?.cashBalance || 0)  // TODO: Add portfolio value
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>


        {/* - Number of Holdings card */}


        {/* - Today's Gain/Loss card (stretch goal) */}


      </Grid>

      {/* Error Modal */}
      <ErrorModal
        open={errorModal.open}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() => setErrorModal({ open: false, title: '', message: '' })}
      />
    </Box>
  )
}

export default DashboardHome;

