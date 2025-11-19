// Generate an Error Modal On Command, with Custom Title, Custom Message imports from the original function

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Stack } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

function ErrorModal({ open, title, message, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            backgroundColor: '#e0e0e0',
          }
        }
      }}
    >
      <DialogTitle>
        <Stack
          spacing={3}
          direction="row"
          alignItems="center"
          sx={{
            color: '#ff0000',
            fontFamily: 'Stack Sans Text, sans-serif'
          }}
        >
          <ErrorOutlineIcon />
          {title}
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Typography
          sx={{
            color: '#cb1d1d',
            fontFamily: 'Stack Sans Text, sans-serif'
          }}
        >
          {message}
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          sx={{
            backgroundColor: '#cb1d1d',
            color: 'white',
            fontFamily: 'Stack Sans Text, sans-serif',
            '&:hover': {
              backgroundColor: '#a50d0dff',
            }
          }}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ErrorModal;
