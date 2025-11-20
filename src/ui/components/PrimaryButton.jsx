import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

const PrimaryButton = styled(Button)(({ theme }) => ({
  padding: '12px 0',
  fontSize: '1rem',
  color: 'black',
  fontWeight: 600,
  textTransform: 'none',
  borderRadius: 10,
  backgroundColor: '#3b82f6',
  ':hover': {
    backgroundColor: '#2e65beff',
  }
}));

export default PrimaryButton;