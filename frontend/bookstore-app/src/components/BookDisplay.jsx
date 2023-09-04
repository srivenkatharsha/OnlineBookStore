import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField, 
  Pagination, 
} from '@mui/material';
import { styled } from '@mui/system';
import api from '../services/api';

// Define custom styles
const StyledSearchContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '10px',
});

const StyledTextField = styled(TextField)({
  flex: 1,
  marginRight: '16px',
});

const useStyles = styled((theme) => ({
  card: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%', // Occupy the entire height of the parent container
  },
  content: {
    flexGrow: 1, // Grow to occupy available space
  },
}));

function BookDisplay() {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [ownershipStatus, setOwnershipStatus] = useState({});
  const [searchTerm, setSearchTerm] = useState(''); // State for search term
  const totalPages = Math.ceil(books.length / itemsPerPage);

  const classes = useStyles(); // Initialize custom styles

  useEffect(() => {
    // Fetch books from the API
    api.get('/api/books')
      .then((response) => {
        setBooks(response.data);
      })
      .catch((error) => {
        console.error('Error fetching books:', error);
      });
  }, []);

  useEffect(() => {
    // Fetch ownership status for each book
    books.forEach((book) => {
      api.get(`/api/ownershipStatus/${book.isbn}`)
        .then((response) => {
          setOwnershipStatus((prevStatus) => ({
            ...prevStatus,
            [book.isbn]: response.data.status,
          }));
        })
        .catch((error) => {
          console.error(`Error fetching ownership status for ${book.isbn}:`, error);
        });
    });
  }, [books]);

  const handleDownloadClick = (isbn) => {
    // Make a GET request to retrieve the download link based on ISBN
    api.get(`/api/getDownloadLink/${isbn}`)
      .then((response) => {
        const downloadLink = response.data.message;
        if (downloadLink) {
          // Open the download link in a new tab
          const newTab = window.open(downloadLink, '_blank');
          if (!newTab) {
            // Handle pop-up blocker or other errors
            alert('Unable to open the download link. Please check your browser settings.');
          }
        } else {
          alert('Download link not available.');
        }
      })
      .catch((error) => {
        console.error('Error fetching download link:', error);
        alert('Error fetching download link. Please try again later.');
      });
  };

  const confirmPurchase = (book) => {
    // Ask the user to confirm the purchase
    const confirmation = prompt(
      `You are about to buy the book "${book.title}" for $${book.price}. To confirm, please type the ISBN number:`
    );
  
    // Check if the confirmation matches the book's ISBN
    if (confirmation === book.isbn) {
      // Initiate the purchase by calling the BuyBook API
      api.get(`/api/buy-book/${book.isbn}`)
        .then((response) => {
          alert(response.data.message); // Show a success message
          
          // Reload the page to reflect the updated ownership status
          window.location.reload();
        })
        .catch((error) => {
          console.error('Error purchasing book:', error);
          alert('Error purchasing the book. Please try again later.');
        });
    } else {
      alert('Purchase canceled. ISBN did not match.'); // Show a cancellation message
    }
  };
  


  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Filter books based on the search term
  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedBooks = filteredBooks.slice(startIndex, endIndex);

  return (
    <div>
      <StyledSearchContainer>
        <StyledTextField
          label="Search Books"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setSearchTerm('')}
        >
          Clear
        </Button>
      </StyledSearchContainer>
      <Grid container spacing={2}>
        {displayedBooks.map((book) => (
          <Grid item xs={12} sm={6} md={4} key={book.ID}>
            <Card className={classes.card}>
              <CardContent className={classes.content}>
                <Typography variant="h5" component="div">
                  {book.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Author: {book.author}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {book.description}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  ISBN: {book.isbn}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Published Year: {book.published_year}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Price: ${book.price}
                </Typography>
              </CardContent>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px' }}>
                {ownershipStatus[book.isbn] ? (
                  <>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleDownloadClick(book.isbn)}
                    >
                      Download
                    </Button>
                    <span style={{ margin: '0 10px' }}></span>
                  </>
                ) : (
                  <Button variant="outlined" color="primary" onClick={() => confirmPurchase(book)}>
                    Buy
                  </Button>
                )}
                <Button variant="outlined" color="primary" onClick={() => window.open(`/review/${book.isbn}`, '_blank')}>
                  Reviews
                </Button>
              </div>
            </Card>
          </Grid>
        ))}
      </Grid>
      <div className="pagination-container">
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          size="large"
        />
      </div>
    </div>

  );
}

export default BookDisplay;
