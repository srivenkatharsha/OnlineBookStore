import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField, // Import TextField for the search bar
  Pagination, // Import Pagination
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

function BookAdminDisplay() {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(6);
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

  const updateBook = async (book) => {
    const title = prompt(`Enter the new title of the book (old version: title is "${book.title}"):`);
    if (title === null) return;

    const author = prompt(`Enter the new author of the book (old version: author is "${book.author}"):`);
    if (author === null) return;

    const description = prompt(`Enter the new book description (old version: description is "${book.description}"):`);
    if (description === null) return;

    const isbn = book.isbn;
    
    const publishedYear = prompt(`Enter the new published year of the book (old version: published year is "${book.published_year}"):`);
    if (publishedYear === null) return;

    const price = parseFloat(prompt(`Enter the new price of the book (old version: price is "${book.price}"):`));
    if (isNaN(price)) return;

    const downloadLink = prompt('Enter the new download link (include https://):');
    if (downloadLink === null) return;

    const updatedBook = {
        title,
        author,
        description,
        isbn,
        published_year: parseInt(publishedYear),
        price,
        download_link: downloadLink,
    };

    api.put(`/api/books/${isbn}`, updatedBook)
        .then((response) => {
            if (response.data.message === 'Book updated successfully') {
                alert('Book updated successfully');
                window.location.reload();
            } else {
                alert('Error: ' + response.data.error);
            }
        })
        .catch((error) => {
            console.error('Error updating book:', error);
            alert('Error updating the book. Please try again later.');
        });
};


  const deleteBook = async (book) => {
    // Ask the user for confirmation
    const confirmation = prompt(
      `Are you sure you want to delete the book "${book.title}"? Type the ISBN to confirm:`
    );
  
    if (confirmation === book.isbn) {
      try {
        // Create an object with book details to send in the DELETE request body
        const bookDetails = {
          title: book.title,
          author: book.author,
          description: book.description,
          isbn: book.isbn,
          published_year: book.published_year,
          price: book.price,
        };
  
        // Send a DELETE request to the API with book details in the body
        const response = await api.delete(`/api/books/${book.isbn}`, {
          data: bookDetails,
        });
  
        if (response.data.message === 'Book deleted successfully') {
          alert('Book deleted successfully');
          window.location.reload(); // Refresh the page
        } else {
          alert('Error: ' + response.data.error);
        }
      } catch (error) {
        console.error('Error deleting book:', error);
        alert('Error deleting the book. Please try again later.');
      }
    } else {
      alert('Deletion canceled. ISBN did not match.');
    }
  };
  
  

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
                <Button variant="outlined" color="primary" onClick={() => deleteBook(book)}>
                    Delete Book
                </Button>
                <Button variant="outlined" color="primary" onClick={() => updateBook(book)}>
                    Update Book
                </Button>
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

export default BookAdminDisplay;
