import React, { useState } from "react"
import {
  Box,
  Button, 
  TextField, 
  Typography, 
  Container, 
  Avatar, 
  CssBaseline, 
} from "@mui/material"
import { handleSignIn } from "./auth"
import ErrorModal from "../Modals/errorModals"
import { useNavigate } from "react-router-dom"

function Login() {
  const[username, setUsername] = useState("");
  const[password, setPassword] = useState("");
  const[errorModal, setErrorModal] = useState({
    open: false,
    title: "",
    message: "",
  })

  const navigate = useNavigate(); 

  
  const handleLogIn = async (e) => {

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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 4,
            borderRadius: 3,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          }}>
            
          </Box>
      </Container>

    </Box>
  )

}

export default Login;



