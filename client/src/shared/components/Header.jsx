import * as React from 'react';
import axios from 'axios';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';

function Header({ pages, onPageChange, onLogout, user }) {

  const handleLogout = async () => {
    try {
      await axios.post('/user/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      onLogout(); 
    }
  };

  return (
    <AppBar position="static"
      sx={{
        backgroundColor: '#305839',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="a"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Fantasy Baseball Draft Kit
          </Typography>
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={() => onPageChange(page)}
                sx={{ my: 2, color: 'white', display: 'block', ":hover": { backgroundColor: '#D9D9D9', color: 'black' } }}
              >
                {page}
              </Button>
            ))}
            <Button
                onClick={handleLogout}
                sx={{ my: 2, color: 'white', display: 'block', ":hover": { backgroundColor: '#D9D9D9', color: 'black' } }}
              >Logout
              </Button>
          </Box>
          <div>{user?.username}</div>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Header;
