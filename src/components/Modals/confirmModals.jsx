// Create a custo modal component that allow users to dictate title, message, with two buttons of Confirm / Cancel and allowing user to
// manipulate the precise action when user click on both

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Stack} from '@mui/material'
import HelpOutlineIcon from '@mui/icons-material/ErrorOutline';

function ConfirmModal({open, title, message, onConfirm, onCancel}) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            backgroundColor: '#12161bff',
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
            color: '#bacbe6ff',
            fontFamily: 'Stack Sans Text, sans-serif'
          }}
        >
          <HelpOutlineIcon/>
          {title}
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Typography
          sx={{
            color: '#bacbe6ff',
            fontFamily: 'Stack Sans Text, sans-serif',
          }}
        >
          {message}
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onCancel}
          sx={{
            backgroundColor: '#cb1d1d',
            color: 'white',
            fontFamily: 'Stack Sans Text, sans-serif',
            '&:hover': {
              backgroundColor: '#a50d0dff',
            }
          }}
        >
          CANCEL
        </Button>

        <Button
          onClick={onConfirm}
          sx={{
            backgroundColor: '#3eb60fff',
            color: 'white',
            fontFamily: 'Stack Sans Text, sans-serif',
            '&:hover': {
              backgroundColor: '#2a7e09ff',
            }
          }}
        >
          CONFIRM
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmModal;