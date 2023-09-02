import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <div className="navbar">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className="navbar-title">
            <NavLink to="/home" className="no-style">
              BookStore<strong>.</strong>
            </NavLink>
          </Typography>
          <NavLink to="/home" className="no-style">
            <Button color="inherit" className="navbar-button">Home</Button>
          </NavLink>
          <NavLink to="/about" className="no-style">
            <Button color="inherit" className="navbar-button">About Us</Button>
          </NavLink>
          <NavLink to="/get-started" className="no-style">
            <Button variant="outlined" color="inherit" className="navbar-button">
              Get Started
            </Button>
          </NavLink>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default Navbar;
