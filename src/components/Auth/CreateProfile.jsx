import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  CssBaseline,
} from '@mui/material';
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "aws-amplify/auth";
import { createUserProfile } from "../../services/dynamodbService";
import CardContainer from "../../ui/components/CardContainer";
import InputField from "../../ui/components/InputField";
import PrimaryButton from "../../ui/components/PrimaryButton";
import ErrorModal from "../Modals/errorModals";

function CreateProfile() {
  const [username, setUsername] = useState("");
  const [cashbalance, setCashbalance] = useState("");
  const [errorModal, setErrorModal] = useState({
    open: false,
    title: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const checkCashError = (cashBalance) => {
    if (!/^\d+$/.test(cashBalance)) return "Cash balance must be a whole number";
    const n = Number(cashBalance);
    if ( n < 0 ) return "Cash balance must be greater than $0";
    if ( n > 1000000 ) return " Cash balance must be less than $1,000,000";
    return "";
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation correct username
    if (username.trim().length === 0) {
      setErrorModal({
        open: true,
        title: "Username Missing",
        message: "Please enter a username for your account"
      });
      return;
    }

    if (cashbalance.trim().length === 0) {
      setErrorModal({
        open: true,
        title: "Cashbalance Missing",
        message: "Please enter a cashbalance for your account"
      });
      return;
    }

    // Now validate the cashabalance for our account
    const err = checkCashError(cashbalance);
    if (err !== "") {
      setErrorModal({
        open: true,
        title: "Cashbalance incorrect",
        message: err
      })
      return;
    }

    // Now that everything is set up, proceed with user profile creation
    setLoading(true);
    try {

      // Get current user's ID from Cognito
      const user = await getCurrentUser();

      // Create user profile in DynamoDB
      await createUserProfile(user.userId, username.trim(), cashbalance);

      console.log('Profile created successfully!');

      // Redirect to dashboard
      navigate('/dashboard');

    } catch (error) {
      console.error('Error creating profile:', error);
      setErrorModal({
        open: true,
        title: "Userprofile creation failed",
        message: error.message || 'An error occured while creating user account'
      });
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: "center",
        justifyContent: "center",
        padding: 2
      }}
    >
      <Container maxWidth="sm">
        <CssBaseline />
        <CardContainer>
          <Typography
            variant="h3"
            sx={{
              fontFamily: 'Stack Sans, Arial, sans-serif',
              color: '#3b82f6',
              fontWeight: 700,
              mb: 1
            }}
          >
            Complete Your Profile Setup
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#94a3b8',
              textAlign: 'center',
              mb: 3,
              fontFamily: 'Stack Sans, Arial, sans-serif',
            }}
          >
            Choose your displayed username and starting balance for trading!
          </Typography>

          <Box component='form' onSubmit={handleSubmit} sx={{ width : '100%' }}>
            <InputField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />

            <InputField
              margin="normal"
              required
              fullWidth
              id="cashBalance"
              label="Starting Balance ($)"
              name="cashBalance"
              type="number"
              value={cashbalance}
              onChange={(e) => setCashbalance(e.target.value)}
              disabled={loading}
              slotProps={{
                input: {
                  min: 1,
                  max: 1000000,
                  step: 1
                }
              }}
            />

            <PrimaryButton
              type="submit"
              fullWidth
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5
              }}
            >
              {loading ? 'Creating Profile ...' : 'Create Profile'}
            </PrimaryButton>

            <ErrorModal
              open={errorModal.open}
              title={errorModal.title}
              message={errorModal.message}
              onClose={() => setErrorModal({open: false, title: '', message: ''})}
            />
          </Box>
        </CardContainer>
      </Container>
    </Box>
  )

}

export default CreateProfile;

