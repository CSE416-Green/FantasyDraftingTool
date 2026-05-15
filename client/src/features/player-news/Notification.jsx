import {Fragment} from 'react';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

function Notification({notificationOpen, setNewsHistoryOpen, setNotificationOpen, news}) {
  const handleNotificationClose = (
    event,
    reason
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotificationOpen(false);
  };

  const handleOpenNewsHistory = () => {
    setNotificationOpen(false);
    setNewsHistoryOpen(true);
  }

  const action = (
    <Fragment>
      <Button size="small" onClick={handleOpenNewsHistory}>
        MORE
      </Button>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleNotificationClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Fragment>
  );

  return (
    <div>
      <Snackbar
        open={notificationOpen}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        message={news?.[0]?.title ? `Latest news: ${news[0].title}` : "No news available"}
        action={action}
      />
    </div>
  );
}

export default Notification;