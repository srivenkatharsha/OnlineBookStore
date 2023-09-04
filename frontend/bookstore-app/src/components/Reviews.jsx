import React, { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Rating,
    Pagination,
    TextField,
    Button,
    Grid,
    Paper,
    Container,
} from '@mui/material';
import api from '../services/api';
import { useParams } from 'react-router-dom';
import NavbarVerified from './NavbarVerified';
import NavbarAdmin from './NavbarAdmin';

const reviewContainerStyle = {
    border: '1px solid #ccc',
    padding: '16px',
    margin: '16px 0',
    borderRadius: '8px',
};

const typographyStyle = {
    margin: '15px',
};

function Reviews() {
    const { isbn } = useParams();
    const [reviews, setReviews] = useState([]);
    const [page, setPage] = useState(1);
    const [itemsPerPage] = useState(2);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const totalPages = Math.ceil(reviews.length / itemsPerPage);

    useEffect(() => {
        api.get(`/api/getReview/${isbn}`)
            .then((response) => {
                setReviews(response.data);
            })
            .catch((error) => {
                console.error('Error fetching reviews:', error);
            });
    }, [isbn]);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleRatingChange = (event, newValue) => {
        setRating(newValue);
    };

    const handleCommentChange = (event) => {
        setComment(event.target.value);
    };

    const handleSubmitReview = () => {
        // Validate and submit the review
        if (rating > 0 && comment.trim() !== '') {
            api.post(`/api/post-review/${isbn}`, {
                rating,
                comment,
            })
                .then(() => {
                    // Clear input fields, fetch updated reviews, and reset page to 1
                    setRating(0);
                    setComment('');
                    fetchReviews();
                    setPage(1);
                })
                .catch((error) => {
                    console.error('Error submitting review:', error);
                });
        } else {
            // Display an alert if rating or comment is missing
            alert('Please provide both a rating and a comment before submitting your review.');
        }
    };
    
    const fetchReviews = () => {
        api.get(`/api/getReview/${isbn}`)
            .then((response) => {
                setReviews(response.data);
            })
            .catch((error) => {
                console.error('Error fetching reviews:', error);
            });
    };

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedReviews = reviews.slice(startIndex, endIndex);
    const username = sessionStorage.getItem('username');

    return (
        <>
            {username === 'admin' ? <NavbarAdmin /> : <NavbarVerified />}
            <Typography variant="h5" style={typographyStyle}>Reviews:</Typography>
            {reviews.length === 0 ? (
                <Typography variant="body1" style={typographyStyle}>No reviews yet. Be the first person to review this book.</Typography>
            ) : (
                displayedReviews.map((review, index) => (
                    <div key={index} style={reviewContainerStyle}>
                        <Typography variant="subtitle1" style={typographyStyle}>{review.userName}</Typography>
                        <Rating value={review.rating} readOnly precision={0.5} />
                        <Typography variant="body1" style={typographyStyle}>{review.comment}</Typography>
                        <Typography variant="caption" style={typographyStyle}>
                            {new Date(review.createdAt).toLocaleString()}
                        </Typography>
                        <hr />
                    </div>
                ))
            )}
            {totalPages > 1 && (
                <div className="pagination-container">
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                    />
                </div>
            )}
            <Container maxWidth="md" style={{ marginBottom: '20px' }}>
                <Paper elevation={3} style={{ padding: '15px' }}>
                    <Typography variant="h5" style={typographyStyle}>Post a Review</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Box>
                                <Rating
                                    name="rating"
                                    value={rating}
                                    precision={1}
                                    onChange={handleRatingChange}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Your Review"
                                variant="outlined"
                                multiline
                                rows={4}
                                fullWidth
                                value={comment}
                                onChange={handleCommentChange}
                            />
                        </Grid>
                    </Grid>
                    <Box mt={2}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmitReview}
                        >
                            Submit Review
                        </Button>
                    </Box>
                </Paper>
            </Container>

        </>
    );
}

export default Reviews;
