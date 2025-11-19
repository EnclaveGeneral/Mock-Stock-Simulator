import React, { useState, useMemo } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    Avatar,
    CssBaseline,
} from "@mui/material"
import { handleSignUp } from "./auth";
import CloseIcon from '@mui/icons-material/Close';
import ErrorModal from "../Modals/errorModals";
import ConfirmModal from "../Modals/confirmModals";
import { useNavigate } from 'react-router-dom'

function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [touched, setTouched] = useState({
        email: false,
        password: false,
        confirmPassword: false
    });
    const [errorModal, setErrorModal] = useState({
        open: false,
        title: "",
        message: ""
    });
    const [registered, setRegistered] = useState(false);
    const [confirmationCode, setConfirmationCode] = useState("");
    const navigate = useNavigate();


    // Compute password errors whenever password or confirmPassword changes
    const passwordErrors = useMemo(() => {
        const errMsgs = [];

        // If both fields are empty, return empty array
        if (!password && !confirmPassword) return errMsgs;

        if (password.length < 8) {
        errMsgs.push("Require At Least 8 Character");
        }
        if (!/[A-Z]/.test(password)) {
        errMsgs.push("Require At Least 1 Uppercase Letter");
        }
        if (!/[a-z]/.test(password)) {
        errMsgs.push("Require At Least 1 Lowercase Letter");
        }
        if (!/[0-9]/.test(password)) {
        errMsgs.push("Require At Least 1 Numerical Number");
        }
        if (!/[!@#$%^&*]/.test(password)) {
        errMsgs.push("Require At Least 1 Special Character");
        }
        if (password !== confirmPassword) {
        errMsgs.push("Password Must Match Confirm Password");
        }

        return errMsgs;
    }, [password, confirmPassword]);


    const handleSubmit = async (e) => {

        // Prevent page from reloading
        e.preventDefault();

        // Mark all fields as touched on submit
        setTouched({ email: true, password: true, confirmPassword: true });

        if (password.length === 0) {
            // Call Material UI Error Modal
            setErrorModal({open: true, title: 'Password Not Found', message: 'Password field cannot be empty'});
            return;
        }
        if (passwordErrors.length > 0) {
            // Call Material UI Error Modal
            setErrorModal({open: true, title: "Password Errors", message: "Password does meet one or more requirement(s)"});
            return;
        }

        console.log("Signing Up With: ", {email, password});

        try {
            const { isSignUpComplete, userId, nextStep } = handleSignUp(email, password);
            // If succeed, we will call registered and transition to the page asking for user registration code!
            if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
                setRegistered(true);
            } else if (nextStep.signUpStep === 'DONE') {
                setErrorModal({
                    open: true,
                    title: "Account Already Registered",
                    message: "Account already exists, please log in directly"
                });
                navigate("/login");

            } else {
                console.log("Auto Sign In");
            }
        } catch (errors) {
            console.log("Signup Errors: ", errors);
            // Call Material UI Error Modals
            setErrorModal({
                open: true,
                title: "SignUp Failed",
                message: errors.message || "An error(s) occured during signup."
            });
            return;
        }

    };

    const handleConfirm = async (e) => {

        // Prevent default
        e.preventDefault();


    }


    // Signup Form
    if (!registered) {
        return (
            <Box sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 2
            }}>
                <Container maxWidth="sm">
                    <CssBaseline />
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            padding: 4,
                            borderRadius: 3,
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                        }}
                    >
                        <Avatar
                            src="../../../assets/login_icon.png"
                            alt="Login Logo"
                            variant="square"
                            sx={{
                                width: 110,
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
                            Sign Up
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
                            Create Your Mock Trader Pro Account Here For Free!
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                            {/* Email Field */}
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={() => setTouched({ ...touched, email: true })}
                            />

                            {/* Password Field */}
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={() => setTouched({ ...touched, password: true })}
                                error={touched.password && password && passwordErrors.length > 0}
                            />

                            {/* Confirm Password Field */}
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="confirmPassword"
                                label="Confirm Password"
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                                error={touched.confirmPassword && confirmPassword && passwordErrors.length > 0}
                                helperText={
                                    touched.confirmPassword && confirmPassword && passwordErrors.length > 0
                                        ? "Passwords don't match"
                                        : ""
                                }
                            />

                            {/* Password Errors Display - Only show failures */}
                            {passwordErrors.length > 0 && (
                                <Box sx={{ mt: 1.5, mb: 1 }}>
                                    {passwordErrors.map((error, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                mb: 0.5
                                            }}
                                        >
                                            <CloseIcon
                                                sx={{
                                                    color: '#ef4444',
                                                    fontSize: '1rem',
                                                    mr: 0.5
                                                }}
                                            />
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: '#ef4444',
                                                    fontFamily: 'Stack Sans Text, sans-serif'
                                                }}
                                            >
                                                {error}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{
                                    mt: 3,
                                    mb: 2,
                                    py: 1.5,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                }}
                            >
                                Sign Up
                            </Button>
                        </Box>
                    </Box>
                </Container>

                {/* Error Modal */}
                <ErrorModal
                    open={errorModal.open}
                    title={errorModal.title}
                    message={errorModal.message}
                    onClose={() => setErrorModal({ open: false, title: "", message: "" })}
                    value={confirmationCode}
                    onChange
                />
            </Box>
        );
    }

    // Confirmation Code Screen
    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2
        }}>
            <Container maxWidth="sm">
                <CssBaseline />
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: 4,
                        borderRadius: 3,
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            fontFamily: 'Stack Sans, Arial, sans-serif',
                            color: '#3b82f6',
                            fontWeight: 700,
                            mb: 2
                        }}
                    >
                        Verify Your Email
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
                        We've sent a verification code to {email}. Please enter it below.
                    </Typography>

                    <Box component='form' onSubmit={handleConfirm} sx={{width: 100%}}>
                        {/* This filed where user will input the email confirmation code */}
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="confirmCode"
                            label="Confirmation Code"

                        >

                        </TextField>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                mt: 3,
                                mb: 2,
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 600,
                                textTransform: 'none',
                            }}
                        >
                            Sign Up
                        </Button>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}

export default Signup