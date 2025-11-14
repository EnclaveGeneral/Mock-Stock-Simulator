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
    
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Signing Up With: ", {email, password});
    };

    return (
        <Container>
            <CssBaseline/>
            <Box 
                sx={{
                    marginTop: 10,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Avatar
                    src="../../../assets/login_icon.png"
                    alt="Login Logo"
                    variant="square"
                    sx={{
                        width: {xs: 50, sm: 80, md: 110, lg: 140, xl: 170},
                        height: {xs: 60, sm: 93, md: 128, lg: 163, xl: 198},
                    }}
                />
                <Typography 
                    component="h2" 
                    variant="h2" 
                    sx={{fontSize: {xs: "15px", md: "30px", xl: "60px"}, fontFamily: ''
                    
                >
                    Sign Up
                </Typography>
                <Typography component="h4" variant="h4">
                    Create Your Mock Trader Pro Account Here For Free!
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{mt: 3}}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password Input"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{mt: 3, mb: 2}}
                    
                    >
                        Sign Up
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}

export default Signup