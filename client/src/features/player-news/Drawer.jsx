import * as React from 'react';
import PropTypes from 'prop-types';
import { Global } from '@emotion/react';
import { styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { grey } from '@mui/material/colors';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import PlayerNews from './PlayerNews';
import Injuries from '../injuries/Injuries';

const drawerBleeding = 56;

const Root = styled('div')(({ theme }) => ({
  height: '100%',
  backgroundColor: grey[100],
  ...theme.applyStyles('dark', {
    backgroundColor: (theme.vars || theme).palette.background.default,
  }),
}));

const StyledBox = styled('div')(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.applyStyles('dark', {
    backgroundColor: grey[800],
  }),
}));

const Puller = styled('div')(({ theme }) => ({
  width: 30,
  height: 6,
  backgroundColor: grey[300],
  borderRadius: 3,
  position: 'absolute',
  top: 8,
  left: 'calc(50% - 15px)',
  ...theme.applyStyles('dark', {
    backgroundColor: grey[900],
  }),
}));

function SwipeableEdgeDrawer(props) {
  const { window } = props;
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('news');

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Root>
      <CssBaseline />
      <Global
        styles={{
          '.MuiDrawer-root > .MuiPaper-root': {
            height: `calc(55% - ${drawerBleeding}px)`,
            overflow: 'visible',
          },
        }}
      />

      <SwipeableDrawer
        allowSwipeInChildren={true}
        container={container}
        anchor="bottom"
        open={open}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
        swipeAreaWidth={drawerBleeding}
        disableSwipeToOpen={false}
        keepMounted
      >
        <StyledBox
          sx={{
            position: 'absolute',
            top: -drawerBleeding,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            visibility: 'visible',
            right: 0,
            left: 0,
          }}
        >
          <Puller />

          <Box sx={{ textAlign: 'right', pt: 1 }}>
            <Button onClick={toggleDrawer(!open)}>
              {open ? 'Close Notifications' : 'Open Notifications'}
            </Button>
          </Box>
        </StyledBox>

        <StyledBox sx={{ px: 3, pb: 2, height: '100%', overflow: 'auto' }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, pt: 2 }}>
            <Button
              variant={activeTab === 'news' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('news')}
            >
              News
            </Button>

            <Button
              variant={activeTab === 'injuries' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('injuries')}
            >
              Injuries
            </Button>
          </Box>

          {activeTab === 'news' && <PlayerNews />}
          {activeTab === 'injuries' && <Injuries />}
        </StyledBox>
      </SwipeableDrawer>
    </Root>
  );
}

SwipeableEdgeDrawer.propTypes = {
  window: PropTypes.func,
};

export default SwipeableEdgeDrawer;