import React, { useState } from "react"
import {
  Box,
  Typography,
  Container,
  Avatar,
  CssBaseline,
} from "@mui/material"
import { handleSignIn } from "./auth"
import ErrorModal from "../Modals/errorModals"
import CardContainer from "../../ui/components/CardContainer"
import { useNavigate } from "react-router-dom"
import InputField from "../../ui/components/InputField"
import PrimaryButton from "../../ui/components/PrimaryButton"
import { Link } from "react-router-dom";

function Login() {
  const[email, setEmail] = useState("");
  const[password, setPassword] = useState("");
  const[errorModal, setErrorModal] = useState({
    open: false,
    title: "",
    message: "",
  })

  const navigate = useNavigate();


  const handleSubmit = async (e) => {

    // Prevent page from reloading
    e.preventDefault();

    if (email.length == 0) {
      setErrorModal({
        open: true,
        title: "Email Missing",
        message: "Please enter your email"
      })
    }

    if (password.length == 0) {
      setErrorModal({
        open: true,
        title: "Password Missing",
        message: "Please enter your password"
      })
    }

    // Try Catch Block For Authenticating
    try {
      const { nextStep} = handleSignIn(email, password);

      if (nextStep.signInStep === "DONE") {
        navigate("/dashboard");
        console.log("Signed In Successfully!");
      }

    } catch (errors) {
      setErrorModal({
        open: true,
        title: "Error(s) during SignIn",
        message: errors.message || "An error(s) has occured during Sign In"
      });
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 2
    }}>
      <Container maxWidth='sm'>
        <CssBaseline/>
        <CardContainer>
          <Avatar
            src="../../../assets/login_icon.png"
            alt="Login Logo"
            variant="square"
            sx={{
                width: 160,
                height: 'auto',
                mb: 2
            }}
          />

          <Typography
            variant="h3"
            sx={{
                fontFamily: 'Stack Sans, Arial, sans-serif',
                color: '#3b82f6',
                fontWeight: 700,
                mb: 1
            }}
          >
            Log In
          </Typography>

          <Typography
              variant="body1"
              sx={{
                  color: '#94a3b8',
                  textAlign: 'center',
                  mb: 3,
                  fontFamily: 'Stack Sans Text, sans-serif'
              }}
          >
              Starting Trading By Log In (Or Create) Your Account Today!
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{width: '100%'}}>
              <InputField
                margin="normal"
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <InputField
                margin="normal"
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <PrimaryButton
                type="submit"
                fullWidth
                sx={{
                  mt: 3,
                  mn: 2,
                  py: 1.5
                }}
              >
                Sign In
              </PrimaryButton>

              <Typography
                component={Link}
                to="/signup"
                sx={{ cursor: "pointer", textDecoration: "underline", mt: 2, display: "block", fontStyle: "italic", color: "#3b82f6"}}
              >
                Click Here To Go To SignUp / Register
              </Typography>


          </Box>
        </CardContainer>
      </Container>

      <ErrorModal
          open={errorModal.open}
          title={errorModal.title}
          message={errorModal.message}
          onClose={() => setErrorModal({ open: false, title: "", message: ""})}
      />
    </Box>
  )

}

export default Login;



