import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './index.css'
import App from './App.jsx'
import { CssBaseline } from '@mui/material';

const theme = createTheme({
  typography: {
    fontFamily: 'Stack Sans Text, sans-serif'
  },
  palette: {
    background: {
      default: '#0c0a049e',
    },
  },
});

createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}>
    <StrictMode>
      <App />
    </StrictMode>
    <CssBaseline />
  </ThemeProvider>
)
