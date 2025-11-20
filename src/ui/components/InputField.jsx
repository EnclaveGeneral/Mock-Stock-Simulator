import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

const InputField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    color: '#b7cdecff',
  },
  '& label': {
    color: '#94a3b8',
  },
  '& label.Mui-focused': {
    color: theme.palette.primary.main,
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#64748b',
    },
    '&:hover fieldset': {
      borderColor: '#94a3b8',
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  }
}));

export default InputField;