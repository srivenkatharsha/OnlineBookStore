import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { NavLink } from 'react-router-dom';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import IconButton from '@mui/material/IconButton';
import api from '../services/api';

function NavbarAdmin() {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateBook = () => {
    // Use prompts to collect book details
    const title = prompt('Enter the title of the book:');
    if (title === null) return; // Check for "Cancel" and return
  
    const author = prompt('Enter the author of the book:');
    if (author === null) return;
  
    const description = prompt('Enter the book description:');
    if (description === null) return;
  
    const isbn = prompt('Enter the ISBN of the book:');
    if (isbn === null) return;
  
    const publishedYear = prompt('Enter the published year of the book:');
    if (publishedYear === null) return;
  
    const price = parseFloat(prompt('Enter the price of the book:'));
    if (price === null) return;
  
    const downloadLink = prompt('Enter the download link of the book:');
    if (downloadLink === null) return;
  
    // Create a book object
    const newBook = {
      title,
      author,
      description,
      isbn,
      published_year: parseInt(publishedYear),
      price,
      download_link: downloadLink,
    };
  
    // Make a POST request to create the book
    api.post('/api/books/create-book', newBook)
      .then((response) => {
        if (response.data.message === 'Book created successfully') {
          alert('Book created successfully');
          window.location.reload(); 
        } else {
          alert('Error: ' + response.data.error);
        }
      })
      .catch((error) => {
        console.error('Error creating book:', error);
        alert('Error creating the book. Please try again later.');
      });
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
      <MenuItem onClick={handleCreateBook}>Create Book</MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  );


  return (
    <div className="navbar">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className="navbar-title">
            <NavLink to="/admin/dashboard" className="no-style">
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

export default NavbarAdmin;




