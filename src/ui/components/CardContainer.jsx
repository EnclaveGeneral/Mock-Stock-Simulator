import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

const CardContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
}));

export default CardContainer;