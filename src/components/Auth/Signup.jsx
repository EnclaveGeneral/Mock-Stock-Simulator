import React, { useState } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    Container, 
    Avatar, 
    CssBaseline,
} from "@mui/material"

function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [touched, setTouched] = useState({ 
        email: false,
        password: false, 
        confirmPassword: false 
    });
    
    // Password validation rules
    const passwordRequirements = {
        minLength: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*]/.test(password),
    };

    const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);
    const passwordsMatch = password === confirmPassword && confirmPassword !== '';
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Mark all fields as touched on submit
        setTouched({ email: true, password: true, confirmPassword: true });
        
        if (!allRequirementsMet) {
            alert("Please meet all password requirements");
            return;
        }
        if (!passwordsMatch) {
            alert("Passwords don't match");
            return;
        }
        
        console.log("Signing Up With: ", {email, password});
        // Here you would call your AWS Cognito signup
    };

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2
        }}>
            <Container maxWidth="sm">
                <CssBaseline/>
                <Box 
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: { xs: 3, md: 4 },
                        borderRadius: 3,
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    <Avatar
                        src="../../../assets/login_icon.png"
                        alt="Login Logo"
                        variant="square"
                        sx={{
                            width: {xs: 50, sm: 80, md: 110, lg: 140, xl: 170},
                            height: {xs: 60, sm: 93, md: 128, lg: 163, xl: 198},
                            mb: 2
                        }}
                    />
                    
                    <Typography 
                        component="h2" 
                        variant="h2" 
                        sx={{
                            fontSize: {xs: "28px", md: "36px", xl: "48px"}, 
                            fontFamily: 'Stack Sans, Arial, sans-serif',
                            color: '#3b82f6',  // Bright blue
                            fontWeight: 700,
                            mb: 1
                        }}
                    >
                        Sign Up
                    </Typography>
                    
                    <Typography 
                        component="h4" 
                        variant="h6"
                        sx={{
                            fontSize: {xs: "14px", md: "16px"},
                            color: '#94a3b8',  // Light gray
                            textAlign: 'center',
                            mb: 3,
                            fontFamily: 'Stack Sans Text, sans-serif'
                        }}
                    >
                        Create Your Mock Trader Pro Account Here For Free!
                    </Typography>
                    
                    <Box component="form" onSubmit={handleSubmit} sx={{width: '100%'}}>
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
                            sx={{
                                '& .MuiInputLabel-root': { 
                                    color: '#94a3b8',
                                    fontFamily: 'Stack Sans Text, sans-serif'
                                },
                                '& .MuiOutlinedInput-root': {
                                    color: '#f1f5f9',
                                    fontFamily: 'Stack Sans Text, sans-serif',
                                    '& fieldset': { 
                                        borderColor: '#334155',
                                        borderWidth: 2
                                    },
                                    '&:hover fieldset': { 
                                        borderColor: '#3b82f6' 
                                    },
                                    '&.Mui-focused fieldset': { 
                                        borderColor: '#3b82f6' 
                                    },
                                }
                            }}
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
                            error={touched.password && password && !allRequirementsMet}
                            sx={{
                                '& .MuiInputLabel-root': { 
                                    color: '#94a3b8',
                                    fontFamily: 'Stack Sans, Arial, sans-serif'
                                },
                                '& .MuiOutlinedInput-root': {
                                    color: '#f1f5f9',
                                    fontFamily: 'Stack Sans, Arial, sans-serif',
                                    '& fieldset': { 
                                        borderColor: '#334155',
                                        borderWidth: 2
                                    },
                                    '&:hover fieldset': { 
                                        borderColor: '#3b82f6' 
                                    },
                                    '&.Mui-focused fieldset': { 
                                        borderColor: '#3b82f6' 
                                    },
                                }
                            }}
                        />

                        {/* Password Requirements Display */}
                        {touched.password && password && (
                            <Box sx={{ mt: 1.5, mb: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        color: passwordRequirements.minLength ? '#22c55e' : '#ef4444',
                                        fontFamily: 'Stack Sans, Arial, sans-serif',
                                        fontSize: '0.8rem',
                                        display: 'block',
                                        mb: 0.3
                                    }}
                                >
                                    {passwordRequirements.minLength ? '✓' : '✗'} At least 8 characters
                                </Typography>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        color: passwordRequirements.hasUpperCase ? '#22c55e' : '#ef4444',
                                        fontFamily: 'Stack Sans, Arial, sans-serif',
                                        fontSize: '0.8rem',
                                        display: 'block',
                                        mb: 0.3
                                    }}
                                >
                                    {passwordRequirements.hasUpperCase ? '✓' : '✗'} One uppercase letter
                                </Typography>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        color: passwordRequirements.hasLowerCase ? '#22c55e' : '#ef4444',
                                        fontFamily: 'Stack Sans, Arial, sans-serif',
                                        fontSize: '0.8rem',
                                        display: 'block',
                                        mb: 0.3
                                    }}
                                >
                                    {passwordRequirements.hasLowerCase ? '✓' : '✗'} One lowercase letter
                                </Typography>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        color: passwordRequirements.hasNumber ? '#22c55e' : '#ef4444',
                                        fontFamily: 'Stack Sans, Arial, sans-serif',
                                        fontSize: '0.8rem',
                                        display: 'block',
                                        mb: 0.3
                                    }}
                                >
                                    {passwordRequirements.hasNumber ? '✓' : '✗'} One number
                                </Typography>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        color: passwordRequirements.hasSpecial ? '#22c55e' : '#ef4444',
                                        fontFamily: 'Stack Sans, Arial, sans-serif',
                                        fontSize: '0.8rem',
                                        display: 'block'
                                    }}
                                >
                                    {passwordRequirements.hasSpecial ? '✓' : '✗'} One special character (!@#$%^&*)
                                </Typography>
                            </Box>
                        )}

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
                            error={touched.confirmPassword && confirmPassword && !passwordsMatch}
                            helperText={
                                touched.confirmPassword && confirmPassword && !passwordsMatch
                                    ? "Passwords don't match"
                                    : ""
                            }
                            sx={{
                                '& .MuiInputLabel-root': { 
                                    color: '#94a3b8',
                                    fontFamily: 'Stack Sans, Arial, sans-serif'
                                },
                                '& .MuiOutlinedInput-root': {
                                    color: '#f1f5f9',
                                    fontFamily: 'Stack Sans, Arial, sans-serif',
                                    '& fieldset': { 
                                        borderColor: '#334155',
                                        borderWidth: 2
                                    },
                                    '&:hover fieldset': { 
                                        borderColor: '#3b82f6' 
                                    },
                                    '&.Mui-focused fieldset': { 
                                        borderColor: '#3b82f6' 
                                    },
                                },
                                '& .MuiFormHelperText-root': {
                                    color: '#ef4444',
                                    fontFamily: 'Stack Sans, Arial, sans-serif'
                                }
                            }}
                        />

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                mt: 3, 
                                mb: 2,
                                py: 1.5,
                                backgroundColor: '#3b82f6',
                                fontFamily: 'Stack Sans, Arial, sans-serif',
                                fontSize: '1rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: '#2563eb'
                                }
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