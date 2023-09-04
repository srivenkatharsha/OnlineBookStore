import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { NavLink } from 'react-router-dom';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import IconButton from '@mui/material/IconButton';
import api from '../services/api';

function NavbarVerified() {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };


  // responses will be in form of browser alert
  const handleLogout = async () => {
    try {
      // Make a GET request to the logout endpoint with credentials (cookies)
      const response = await api.get('/api/auth/logout');

      if (response.status === 200 && response.data.message === 'Logged out successfully') {
        // Clear sessionStorage and redirect to the home page upon successful logout
        sessionStorage.clear();
        window.location.href = '/home';
      } else {
        // Handle unexpected response
        console.log('Unexpected response:', response.data);
        // Display an alert with the error message if available
        if (response.data.error) {
          window.alert(response.data.error);
        }
      }
    } catch (error) {
      // Handle network or other errors
      console.error('Error:', error);
      // Display an alert with the error message if available
      if (error.response && error.response.data.error) {
        window.alert(error.response.data.error);
      }
    } finally {
      // Close any menu or perform cleanup actions
      handleMenuClose();
    }
  }



  const deleteAccountProcedure = async () => {
    try {
      // Prompt the user with a confirmation message
      const confirmation = window.confirm(
        'This action is critical. Your account details will be preserved for 30 days as per policy. Do you want to proceed?'
      );

      if (!confirmation) {
        // If the user clicks "Cancel," do nothing and exit the function
        return;
      }

      // Ask the user to enter their username, email, and password
      const username = window.prompt('Enter your username:');
      // Get the username from session storage
      const storedUsername = sessionStorage.getItem('username');

      // Verify if the entered username matches the one in session storage
      if (username !== storedUsername) {
        // If it doesn't match, alert the user and advise them to clear cookies
        window.alert('Something went wrong!');
        handleMenuClose();
        return;
      }
      const email = window.prompt('Enter your email:');
      if (!email){
        handleMenuClose();
        return;
      }
      const password = window.prompt('Enter your password:');
      if(!email){
        handleMenuClose();
        return;
      }

      // Create a request body with the provided data
      const requestBody = {
        username,
        email,
        password,
      };

      // Make a DELETE request to the backend route
      const response = await api.delete('/api/auth/delete-account', {
        data: requestBody, // Include the request body in the DELETE request
      });

      if (response.status === 200) {
        // Check the response message to confirm if the account was deleted
        if (response.data.message === 'Account is successfully deleted') {
          // Display a success message
          window.alert('Your account has been successfully deleted.');
          // Logout the user
          handleLogout(); // Assuming you have a logout function defined
        } else {
          // Handle unexpected responses
          console.log('Unexpected response:', response.data);
          window.alert('An error occurred while deleting your account.');
          handleMenuClose();
        }
      } else {
        // Handle unexpected responses
        console.log('Unexpected response:', response.data);
        window.alert('An error occurred while deleting your account.');
        handleMenuClose();
      }
    } catch (error) {
      // Handle network or other errors
      console.error('Error:', error);
      window.alert('An error occurred while processing your request.');
      handleMenuClose();
    }
    finally{
      handleMenuClose();
    }
  };



  const getBalance = async () => {
    try {
      // Make a GET request to the backend route
      const response = await api.get('/api/getBalance');

      if (response.status === 200) {
        // Handle the response data as needed
        const balance = response.data.balance.toFixed(2); // Assuming the server returns a 'balance' field
        console.log('Balance:', balance);
        window.alert('Your total balance: ' + balance);
      } else {
        // Handle unexpected responses here
        console.log('Unexpected response:', response.data);
        if (response.data.error) {
          // Log the error message to the console
          console.error('Error:', response.data.error);
          // Display an alert with the error message
          window.alert(response.data.error);
        }
      }
    } catch (error) {
      // Handle network or other errors
      console.error('Error:', error);
      // Display an alert with a generic error message
      window.alert('An error occurred while fetching balance.');
      // You can add additional error handling here if needed
    }
    finally {
      // Close any menu or perform cleanup actions
      handleMenuClose();
    }
  };


  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      {/* <MenuItem onClick={handleMenuClose}>Profile</MenuItem> */}
      <MenuItem onClick={getBalance}>My Balance</MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
      <MenuItem onClick={deleteAccountProcedure}>Delete Account</MenuItem>
    </Menu>
  );


  return (
    <div className="navbar">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className="navbar-title">
            <NavLink to="/dashboard" className="no-style">
              BookStore<strong>.</strong>
            </NavLink>
          </Typography>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls={menuId}
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <AccountCircle style={{ fontSize: '35px' }} />
          </IconButton>
          {renderMenu}
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default NavbarVerified;




